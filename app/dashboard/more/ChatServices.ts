// src/services/chatService.ts
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  setDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { v4 as uuidv4 } from "uuid";

const db = FIREBASE_DB;

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  lastMessageSender?: string;
  createdAt: Date;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  readBy?: string[];
}

export const createChat = async (participants: string[]) => {
  const chatId = uuidv4();
  const chatRef = doc(db, "chats", chatId);

  await setDoc(chatRef, {
    participants,
    createdAt: serverTimestamp(),
  });

  return chatId;
};

export const getOrCreateChat = async (user1Id: string, user2Id: string) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", user1Id));

  const querySnapshot = await getDocs(q);
  let existingChat: Chat | null = null;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (
      data.participants.includes(user1Id) &&
      data.participants.includes(user2Id)
    ) {
      existingChat = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as Chat;
    }
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new chat if none exists
  return await createChat([user1Id, user2Id]);
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  const messageData = {
    senderId,
    content,
    timestamp: serverTimestamp(),
    status: "sent",
    readBy: [senderId],
  };

  const batch = [
    addDoc(messagesRef, messageData),
    updateDoc(chatRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      lastMessageSender: senderId,
    }),
  ];

  await Promise.all(batch);
};

export const markMessagesAsDelivered = async (
  chatId: string,
  messageIds: string[]
) => {
  if (!messageIds.length) return;

  const batch = messageIds.map((messageId) => {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    return updateDoc(messageRef, {
      status: "delivered",
    });
  });

  await Promise.all(batch);
};

export const markMessagesAsRead = async (
  chatId: string,
  userId: string,
  messageIds: string[]
) => {
  if (!messageIds.length) return;

  const batch = messageIds.map((messageId) => {
    const messageRef = doc(db, "chats", chatId, "messages", messageId);
    return updateDoc(messageRef, {
      status: "read",
      readBy: arrayUnion(userId),
    });
  });

  await Promise.all(batch);
};

export const getChatMessages = async (chatId: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as Message[];
};

export const getUserChats = async (userId: string) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    lastMessageAt: doc.data().lastMessageAt?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Chat[];
};
