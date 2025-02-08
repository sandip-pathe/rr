"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import Spiner from "@/components/Spiner";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/auth/AuthContext";
import {
  HiOutlineShare,
  HiOutlineTrash,
  HiArrowUturnLeft,
} from "react-icons/hi2";
import { copyLinkToClipboard, formatDate } from "../helper";

export interface Reply {
  id: string;
  content: string;
  author: string;
  created_at: string;
  parent_id?: string | null;
  questionId: string;
  replies?: Reply[];
  authorId?: string;
  authorName?: string;
  deleted?: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorId: string;
  created_at: string;
  replies?: Reply[];
}

const buildNestedReplies = (flatReplies: Reply[]): Reply[] => {
  const replyMap: { [key: string]: Reply } = {};
  const rootReplies: Reply[] = [];

  flatReplies.forEach((reply) => {
    reply.replies = [];
    replyMap[reply.id] = reply;
  });

  flatReplies.forEach((reply) => {
    if (reply.parent_id) {
      replyMap[reply.parent_id]?.replies?.push(reply);
    } else {
      rootReplies.push(reply);
    }
  });

  return rootReplies;
};

interface ReplyItemProps {
  reply: Reply;
  onPostReply: (replyText: string, parentId: string | null) => Promise<void>;
  onDeleteReply: (replyId: string) => Promise<void>;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  onPostReply,
  onDeleteReply,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const { user } = useAuth();
  const isAuthor = user?.uid === reply.authorId;

  const handleSubmitReply = async () => {
    if (!replyInput.trim()) return;
    await onPostReply(replyInput, reply.id);
    setReplyInput("");
    setShowReplyInput(false);
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    if (window.confirm("Are you sure you want to delete this reply?")) {
      await onDeleteReply(reply.id);
    }
  };

  const handleShare = async (questionId: string, replyId: string) => {
    const link = `${window.location.origin}/dashboard/ama/${questionId}#reply-${replyId}`;
    copyLinkToClipboard(link);
    console.log("Link copied to clipboard:", link);
  };

  return (
    <div className="ml-10" key={reply.id} id={`reply-${reply.id}`}>
      <Card className="bg-inherit border-none">
        {!reply.deleted && (
          <CardHeader className="p-0 flex flex-row items-center gap-1 justify-start">
            <Avatar className="h-8 w-8 bg-gray-800">
              <AvatarImage src="https://placehold.co/400" alt={reply.author} />
              <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <CardTitle className="font-medium text-xs text-gray-300">
                {reply.author}
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                {formatDate(reply.created_at)}
              </CardDescription>
            </div>
          </CardHeader>
        )}
        <CardContent className="ml-10 py-2 px-0">
          <p
            className={
              reply.deleted
                ? "text-red-500 text-sm font-normal"
                : "text-gray-200 text-sm font-normal"
            }
          >
            {reply.deleted
              ? "This reply has been deleted by user"
              : reply.content}
          </p>
        </CardContent>
        {!reply.deleted && (
          <div className="flex flex-row items-center gap-2">
            <button
              className="flex items-center gap-1 text-blue-400 text-xs hover:bg-slate-600 p-1 rounded-lg"
              onClick={() => setShowReplyInput((prev) => !prev)}
            >
              <HiArrowUturnLeft />
              Reply
            </button>
            <button
              className="flex items-center gap-1 text-blue-400 text-xs hover:bg-slate-600 p-1 rounded-lg"
              onClick={() => handleShare(reply.questionId, reply.id)}
            >
              <HiOutlineShare />
              Share
            </button>
            {isAuthor && (
              <button
                className="flex items-center gap-1 text-red-700 text-xs hover:bg-slate-600 p-1 rounded-lg"
                onClick={handleDelete}
              >
                <HiOutlineTrash />
              </button>
            )}
          </div>
        )}

        {showReplyInput && (
          <div className="mt-1 ml-10 w-full flex flex-col">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Write a reply..."
              className="w-[calc(100%-5rem)] p-2 rounded-lg text-white"
            />
            <button
              onClick={handleSubmitReply}
              className="mt-1 py-1 px-3 bg-[#5720B7] rounded-lg w-[10%]"
            >
              send
            </button>
          </div>
        )}

        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-4 border-l border-gray-600 pl-4">
            {reply.replies.map((childReply) => (
              <ReplyItem
                key={childReply.id}
                reply={childReply}
                onPostReply={onPostReply}
                onDeleteReply={onDeleteReply}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const QuestionThread = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [topReply, setTopReply] = useState<string>("");
  const pathname = usePathname();
  const questionId = pathname.split("/").pop() as string;
  const { user, name } = useAuth();
  const isAuthor = user?.uid === question?.authorId;

  useEffect(() => {
    const fetchQuestionWithReplies = async () => {
      try {
        const docRef = doc(FIREBASE_DB, "ama", questionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Question;
          setQuestion(data);
          setReplies(data.replies || []);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionWithReplies();
  }, [questionId]);

  const handlePostReply = async (
    replyText: string,
    parentId: string | null = null
  ) => {
    if (!replyText.trim()) return;
    try {
      const newReplyObj: Reply = {
        id: crypto.randomUUID(),
        content: replyText,
        authorId: user?.uid,
        author: name || "Anonymous",
        created_at: new Date().toISOString(),
        parent_id: parentId,
        questionId: questionId,
      };
      const updatedReplies = [...replies, newReplyObj];
      setReplies(updatedReplies);
      await updateDoc(doc(FIREBASE_DB, "ama", questionId), {
        replies: updatedReplies,
      });
    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const updatedReplies = replies.map((r) =>
      r.id === replyId ? { ...r, deleted: true } : r
    );
    try {
      await updateDoc(doc(FIREBASE_DB, "ama", questionId), {
        replies: updatedReplies,
      });
      setReplies(updatedReplies);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  const handleShare = async (questionId: string) => {
    const link = `${window.location.origin}/dashboard/ama/${questionId}`;
    copyLinkToClipboard(link);
    console.log("Link copied to clipboard:", link);
  };

  const nestedReplies = buildNestedReplies(replies);

  if (loading)
    return (
      <Layout>
        <Spiner />
      </Layout>
    );

  if (!question)
    return (
      <Layout>
        <p>No questions found</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-row gap-5">
        <div className="ml-10 mt-10 w-2/3">
          <CardHeader className="p-0 flex flex-row items-center gap-4 justify-start">
            <Avatar className="h-10 w-10 bg-gray-800">
              <AvatarImage
                src="https://placehold.co/400"
                alt={question.authorName}
              />
              <AvatarFallback>{question.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <CardTitle className="font-medium text-base text-gray-100">
                {question.authorName}
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                {formatDate(question.created_at)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardTitle className="py-2">{question.title}</CardTitle>
          <CardContent className="py-2 px-0">
            <p className="text-gray-200 text-base font-normal">
              {question.description}
            </p>
          </CardContent>
          <div className="mt-4">
            <input
              type="text"
              value={topReply}
              onChange={(e) => setTopReply(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 rounded-lg text-white"
            />
            <div className="flex flex-row items-center gap-2">
              <button
                onClick={async () => {
                  if (topReply.trim()) {
                    await handlePostReply(topReply, null);
                    setTopReply("");
                  }
                }}
                className="mt-2 p-2 bg-[#5720B7] rounded"
              >
                Post Reply
              </button>
              <button
                className="flex items-center gap-1 text-blue-400 text-base hover:bg-slate-600 p-1 rounded-lg"
                onClick={() => handleShare(questionId)}
              >
                <HiOutlineShare />
                Share
              </button>
              {isAuthor && (
                <button className="flex items-center gap-1 text-red-700 text-base hover:bg-slate-600 p-1 rounded-lg">
                  <HiOutlineTrash />
                </button>
              )}
            </div>
          </div>

          {/* Render nested replies */}
          <div className="mt-8">
            {nestedReplies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                onPostReply={handlePostReply}
                onDeleteReply={handleDeleteReply}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionThread;
