"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface Score {
  score: number;
  reasoning?: string;
}

interface Rating {
  scores: Score[];
  feedback: string;
  improvement: string;
}

export default function RatingPage() {
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get the URI from URL query parameters
  const getUri = () => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("uri");
  };

  const fetchRating = async () => {
    const uri = getUri();
    if (!uri) {
      setError("No URI provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/rating?uri=${encodeURIComponent(uri)}`
      );
      const data = await response.json();

      if (response.status === 202) {
        setTimeout(fetchRating, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rating");
      }

      setRating(data);
      setLoading(false);
      setError(null);

      // Trigger confetti if score is above 70%
      const totalScore = data.scores.reduce(
        (sum: number, score: Score) => sum + score.score,
        0
      );
      const percentage = Math.round((totalScore / data.scores.length) * 100);
      if (percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRating();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              className="absolute inset-0 border-t-4 border-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-foreground text-lg"
          >
            Analyzing your responses...
          </motion.p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 p-8 bg-card rounded-xl border max-w-md mx-4 shadow-lg"
        >
          <p className="text-destructive text-lg">{error}</p>
          <button
            onClick={fetchRating}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!rating) return null;

  const totalScore = rating.scores.reduce((sum, score) => sum + score.score, 0);
  const totalQuestions = rating.scores.length;
  const percentage = Math.round((totalScore / totalQuestions) * 100);

  // Group questions by correctness
  const questionsWithIndex = rating.scores.map((score, index) => ({
    ...score,
    index: index + 1,
  }));
  const correctQuestions = questionsWithIndex.filter((score) => score.score);
  const incorrectQuestions = questionsWithIndex.filter((score) => !score.score);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-primary/80 uppercase tracking-wider mb-1"
            >
              Quiz Results
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-baseline gap-2"
            >
              <h1 className="text-2xl font-medium text-foreground">
                {percentage >= 70
                  ? "Well done!"
                  : percentage >= 40
                  ? "Keep practicing!"
                  : "Let's improve!"}
              </h1>
              <span className="text-muted-foreground">
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex items-center gap-4 bg-secondary/[0.03] p-4 rounded-lg border border-border self-start"
          >
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-border"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${(percentage / 100) * 176} 176`}
                  className={`${
                    percentage >= 70
                      ? "text-success"
                      : percentage >= 40
                      ? "text-primary"
                      : "text-destructive"
                  } transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{percentage}%</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-foreground">
                  {totalScore}
                </span>
                <span className="text-sm text-muted-foreground">
                  correct answers
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                out of {totalQuestions} questions
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-border/40 pb-6"
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            {rating.feedback}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {correctQuestions.length > 0 && (
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4">
                Correct Answers ({correctQuestions.length})
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {correctQuestions.map((score, index) => (
                  <motion.div
                    key={score.index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-muted-foreground">
                        Question {score.index}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-sm bg-success/10 text-success">
                        Correct
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {incorrectQuestions.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-destructive uppercase tracking-wider mb-4">
                Needs Improvement ({incorrectQuestions.length})
              </h2>
              <div className="space-y-3">
                {incorrectQuestions.map((score, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-muted-foreground">
                        Question {score.index}
                      </h3>
                      <span className="text-sm text-destructive">
                        Incorrect
                      </span>
                    </div>
                    {score.reasoning && (
                      <p className="text-sm text-muted-foreground">
                        {score.reasoning}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-secondary/[0.03] rounded-lg p-6 border border-border hover:bg-secondary/[0.05] transition-colors"
        >
          <h2 className="text-sm font-medium uppercase tracking-wider mb-4">
            Areas for Improvement
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {rating.improvement}
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
          >
            Dive Deeper
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
