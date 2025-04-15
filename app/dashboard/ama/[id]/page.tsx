"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import Spiner from "@/components/Spiner";
import { FIREBASE_DB, FIREBASE_STORAGE } from "@/FirebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/app/auth/AuthContext";
import {
  HiOutlineShare,
  HiOutlineTrash,
  HiArrowUturnLeft,
  HiOutlineDocument,
} from "react-icons/hi2";
import { copyLinkToClipboard, formatDate } from "../helper";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { generateAndUpdateAMASummary } from "@/components/AMASummary";

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
  images?: string[];
  documents?: { name: string; url: string }[];
  isAnonymous?: boolean;
  summary?: Summary;
}

export interface Summary {
  content: string;
  lastUpdated: string;
  version: number;
  generatedAtReplyCount: number;
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
    if (!replyInput.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
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
    await copyLinkToClipboard(link);
    toast.success("Reply link copied to clipboard!");
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
                ? "text-red-500 text-sm font-normal italic"
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
                className="flex items-center gap-1 text-red-500 text-xs hover:bg-slate-600 p-1 rounded-lg"
                onClick={handleDelete}
              >
                <HiOutlineTrash />
                Delete
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
              className="w-[calc(100%-5rem)] p-2 rounded-lg bg-gray-800 text-white border border-gray-700"
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSubmitReply}
                className="bg-[#5720B7] hover:bg-[#4a1c9d]"
                size="sm"
              >
                Post Reply
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReplyInput(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [topReply, setTopReply] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [documentUrls, setDocumentUrls] = useState<
    { name: string; url: string }[]
  >([]);
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([]);
  const pathname = usePathname();
  const questionId = pathname.split("/").pop() as string;
  const { user, name } = useAuth();
  const isAuthor = user?.uid === question?.authorId;
  const [concernedPeople, setConcernedPeople] = useState<
    { name: string; expertise: string }[]
  >([]);
  const [topicExplanations, setTopicExplanations] = useState<
    { title: string; content: string }[]
  >([]);

  useEffect(() => {
    const fetchQuestionWithReplies = async () => {
      try {
        const docRef = doc(FIREBASE_DB, "ama", questionId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Question;
          setQuestion(data);
          setReplies(data.replies || []);
          setSummary(data?.summary || null);

          // Safely handle images
          if (data.images && Array.isArray(data.images)) {
            try {
              const urls = await Promise.all(
                data.images.map(async (imgPath) => {
                  const storageRef = ref(FIREBASE_STORAGE, imgPath);
                  return getDownloadURL(storageRef);
                })
              );
              setImageUrls(urls);
            } catch (error) {
              console.error("Error loading images:", error);
              toast.error("Failed to load some images");
            }
          }

          // Set document URLs if they exist
          if (data.documents && Array.isArray(data.documents)) {
            setDocumentUrls(data.documents);
          }
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error("Failed to load question");
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
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    if (!user) {
      toast.error("Please login to post a reply");
      return;
    }

    try {
      const newReplyObj: Reply = {
        id: crypto.randomUUID(),
        content: replyText,
        authorId: user.uid,
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
      toast.success("Reply posted successfully!");
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const updatedReplies = replies.map((r) =>
        r.id === replyId ? { ...r, deleted: true } : r
      );
      await updateDoc(doc(FIREBASE_DB, "ama", questionId), {
        replies: updatedReplies,
      });
      setReplies(updatedReplies);
      toast.success("Reply deleted successfully");
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };

  const handleShare = async (questionId: string) => {
    const link = `${window.location.origin}/dashboard/ama/${questionId}`;
    await copyLinkToClipboard(link);
    toast.success("Question link copied to clipboard!");
  };

  const handleDeleteQuestion = async () => {
    if (!isAuthor) return;
    if (
      window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(FIREBASE_DB, "ama", questionId));
        toast.success("Question deleted successfully");
        window.location.href = "/dashboard/ama";
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
  };

  useEffect(() => {
    const repliesCount = replies.filter((reply) => !reply.deleted).length;

    const shouldSummarize =
      repliesCount === 1 ||
      (repliesCount > (summary?.generatedAtReplyCount ?? 0) &&
        repliesCount % 5 === 0);

    if (shouldSummarize) {
      generateAndUpdateAMASummary(questionId, repliesCount);
    }
  }, [replies.length]);

  const nestedReplies = buildNestedReplies(replies);

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spiner />
        </div>
      </Layout>
    );

  if (!question)
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <p className="text-gray-400">Question not found</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex flex-row gap-5">
        <div className="ml-10 mt-10 w-full lg:w-2/3">
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
                {question.isAnonymous ? "Anonymous" : question.authorName}
              </CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                {formatDate(question.created_at)}
              </CardDescription>
            </div>
          </CardHeader>

          <CardTitle className="py-2 text-xl font-bold text-gray-100">
            {question.title}
          </CardTitle>

          <CardContent className="py-2 px-0">
            <p className="text-gray-200 text-base font-normal mb-4">
              {question.description}
            </p>

            {/* Display Images */}
            {imageUrls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-300 font-medium mb-2">
                  Attached Images
                </h3>
                <div className="flex flex-wrap gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative w-full max-w-xs h-48">
                      <Image
                        src={url}
                        alt={`Question image ${index + 1}`}
                        fill
                        className="object-contain rounded-md border border-gray-700"
                        unoptimized // For Firebase Storage URLs
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display Documents */}
            {documentUrls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-gray-300 font-medium mb-2">
                  Attached Documents
                </h3>
                <div className="flex flex-wrap gap-2">
                  {documentUrls.map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <HiOutlineDocument className="text-blue-400" />
                      <span className="text-gray-300 text-sm">
                        {doc.name.length > 30
                          ? `${doc.name.substring(0, 27)}...`
                          : doc.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* Question Actions */}
          <div className="flex items-center gap-4 mt-4 mb-6">
            <Button
              variant="outline"
              onClick={() => handleShare(questionId)}
              className="flex items-center gap-1"
            >
              <HiOutlineShare />
              Share Question
            </Button>
            {isAuthor && (
              <Button
                variant="destructive"
                onClick={handleDeleteQuestion}
                className="flex items-center gap-1"
              >
                <HiOutlineTrash />
                Delete Question
              </Button>
            )}
          </div>

          {/* Reply Input */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">
              {replies.length > 0
                ? `${replies.length} Replies`
                : "Be the first to reply"}
            </h3>
            <div className="flex flex-col gap-2">
              <textarea
                value={topReply}
                onChange={(e) => setTopReply(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 min-h-[100px]"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTopReply("")}>
                  Clear
                </Button>
                <Button
                  onClick={async () => {
                    if (topReply.trim()) {
                      await handlePostReply(topReply, null);
                      setTopReply("");
                    }
                  }}
                  className="bg-white font-medium hover:bg-gray-200 text-gray-800 hover:text-gray-900"
                  disabled={!topReply.trim()}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>

          {/* Render nested replies */}
          <div className="mt-8 space-y-6 mb-10">
            {nestedReplies.length > 0 ? (
              nestedReplies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  onPostReply={handlePostReply}
                  onDeleteReply={handleDeleteReply}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No replies yet. Start the discussion!
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-6 mt-10 mr-10">
          {summary && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Conversation Summary ✨
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  Last updated: {formatDate(summary.lastUpdated)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none text-sm">
                  {summary.content.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-3 text-gray-300">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-gray-500">
                  <p>
                    <strong>Note:</strong> Summaries are generated by AI and may
                    not be perfectly accurate.
                  </p>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuestionThread;
