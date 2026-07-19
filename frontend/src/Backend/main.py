from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
from typing import Optional

class Request(BaseModel):
    name: str
    message: str
    conversation_id: Optional[int] = None

class IdPass(BaseModel):
    username:str
    password:str


#Password hashing---
hash_pass = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
def hash_password(password):
    return hash_pass.hash(password)

def verify_password(plain_password, hashed_password):
    return hash_pass.verify(plain_password, hashed_password)


#OpenAI and llm---
llm=ChatOpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="YOUR API KEY",
  model="openai/gpt-oss-20b:free"
)

prompt = ChatPromptTemplate(
    [
        ("system",
         'You are a helpful AI assistant. User name: {user_name}. Keep answers short (2-3 lines). Be friendly and natural. Ask follow up questions sometimes'),
        MessagesPlaceholder(variable_name='history'),
        ('user', '{input}')
    ]
)

chain = prompt | llm


#Database---
DATABASE_URL = "postgresql://postgres:7932@localhost/chatbotdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    username = Column(
        String(100),
        unique=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    conversations = relationship(
        "Conversation",
        back_populates="user"
    )

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    title = Column(String(255))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="conversations"
    )

    messages = relationship(
        "Message",
        back_populates="conversation"
    )

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id")
    )

    role = Column(String(20))

    content = Column(Text)

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages"
    )
Base.metadata.create_all(bind=engine)


#FastAPI---
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {'message':'Welcome to the chatbot'}

@app.post("/sign-up")
def signup(signup_info:IdPass):
    db=SessionLocal()
    try:
        all_users=db.query(User).all()

        for user in all_users:
            if user.username==signup_info.username:
                return {"message":"user already exists"}

        print("Username:", signup_info.username)
        print("Password:", signup_info.password)
        print("Length:", len(signup_info.password))
        print(type(signup_info.password))
        new_user=User(
            username=signup_info.username,
            hashed_password=hash_password(signup_info.password)
        )
        db.add(new_user)
        db.commit()
        return {"message": "OK"}
    finally:
        db.close()


@app.post('/login')
def login(login_info:IdPass):
    db = SessionLocal()
    try:
        all_users = db.query(User).all()

        for user in all_users:

            if user.username == login_info.username:
                if verify_password(login_info.password, user.hashed_password):
                    return {"message": "OK"}
                else:
                    return {"message": "incorrect password"}

        return {"message": "user does not exists"}

    finally:
        db.close()

@app.post("/new_chat")
def new_chat():
    return {
        "conversation_id": None
    }

@app.get("/conversations/{username}")
def get_conversations(username: str):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == username.lower()
        ).first()

        if user is None:
            return []

        conversations = (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user.id
            )
            .order_by(
                Conversation.created_at.desc()
            )
            .all()
        )

        return [
            {
                "id": c.id,
                "title": c.title,
                "created_at": c.created_at
            }
            for c in conversations
        ]

    finally:
        db.close()

@app.get("/messages/{conversation_id}")
def get_messages(conversation_id: int):

    db = SessionLocal()

    try:

        messages = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.timestamp)
            .all()
        )

        return [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp
            }
            for m in messages
        ]

    finally:
        db.close()

@app.post("/chat_request")
def chat_request(request: Request):
    print(request)
    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.username == request.name.lower()
        ).first()

        if user is None:
            return {"error": "User not found"}

        if request.conversation_id is None:

            title = request.message[:40]

            conversation = Conversation(
                user_id=user.id,
                title=title
            )

            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        else:

            conversation = db.query(Conversation).filter(
                Conversation.id == request.conversation_id,
                Conversation.user_id == user.id
            ).first()

            if conversation is None:
                return {"error": "Conversation not found"}

        history = []

        messages = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation.id
            )
            .order_by(Message.timestamp)
            .all()
        )

        for msg in messages:

            if msg.role == "user":
                history.append(
                    HumanMessage(content=msg.content)
                )

            else:
                history.append(
                    AIMessage(content=msg.content)
                )

        reply = chain.invoke({
            "user_name": request.name,
            "history": history,
            "input": request.message
        })

        db.add(
            Message(
                conversation_id=conversation.id,
                role="user",
                content=request.message
            )
        )

        db.add(
            Message(
                conversation_id=conversation.id,
                role="assistant",
                content=reply.content
            )
        )

        db.commit()

        return {
            "reply": reply.content,
            "conversation_id": conversation.id,
            "title": conversation.title
        }

    except Exception as e:
        return {
            "error": str(e)
        }

    finally:
        db.close()
