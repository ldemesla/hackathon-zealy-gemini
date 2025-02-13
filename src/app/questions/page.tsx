"use client";

import React, { useState, useEffect } from "react";
import { rateAnswers } from "@/actions/rateAnswers";
import { useRouter } from "next/navigation";

interface Question {
  reasoning: string;
  type:
    | "multiple choice"
    | "true/false"
    | "short answer"
    | "long answer"
    | "exercise";
  question: string;
  options?: string[];
  answer: string;
}

const questions: Question[] = [
  {
    reasoning: "I'm asking this question because...",
    type: "multiple choice",
    question: "What is the main topic of the document?",
    options: ["Spaghetti", "Pizza", "Lasagna", "Rice"],
    answer: "Spaghetti",
  },
  {
    reasoning: "I'm asking this question because...",
    type: "true/false",
    question: "Is the document about a new product?",
    answer: "True",
  },
  {
    reasoning: "I'm asking this question because...",
    type: "short answer",
    question: "What is the main topic of the document?",
    answer: "Spaghetti",
  },
  {
    reasoning: "I'm asking this question because...",
    type: "long answer",
    question: "What is the main topic of the document?",
    answer: "The main topic of the document is spaghetti.",
  },
  {
    reasoning: "I'm asking this question because...",
    type: "exercise",
    question:
      "Write a piece of code that implements the algorithm described in the document.",
    answer: "function algorithm(input) { return output; }",
  },
];

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  // Get the URI from URL query parameters
  const getUri = () => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("uri");
  };

  const fetchQuestions = async () => {
    const uri = getUri();
    if (!uri) {
      setError("No URI provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/questions?uri=${encodeURIComponent(uri)}`
      );
      const data = await response.json();

      if (response.status === 202) {
        // Questions are still generating, continue polling
        setTimeout(fetchQuestions, 2000); // Poll every 2 seconds
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch questions");
      }

      setQuestions(data.questions);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground">Generating questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-6 bg-card rounded-lg border max-w-md mx-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchQuestions}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // Check if all questions have been answered (non-empty trimmed responses)
  const allAnswered =
    questions.length === Object.keys(answers).length &&
    Object.values(answers).every((val) => val.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const uri = getUri();
    if (!uri) {
      setError("No URI provided");
      return;
    }

    // Format questions with answers
    const questionsWithAnswers = questions.map((q, index) => ({
      question: q.question,
      answer: answers[index],
    }));

    try {
      await rateAnswers(questionsWithAnswers, uri);
      router.push(`/rating?uri=${encodeURIComponent(uri)}`);
    } catch (error) {
      setError("Failed to submit answers. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">
          Quiz
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={index}
              className="bg-card rounded-lg shadow-sm border p-6"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[hsl(var(--question-tag))] text-[hsl(var(--question-tag-foreground))] text-sm font-medium px-2.5 py-0.5 rounded-full">
                    Question {index + 1}
                  </span>
                </div>

                <p className="text-lg font-medium text-card-foreground">
                  {q.question}
                </p>

                {/* Multiple Choice */}
                {q.type === "multiple choice" && q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          className="w-4 h-4 text-primary border-input"
                        />
                        <span className="ml-3 text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {q.type === "true/false" && (
                  <div className="space-y-2">
                    {["True", "False"].map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          className="w-4 h-4 text-primary border-input"
                        />
                        <span className="ml-3 text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Short Answer */}
                {q.type === "short answer" && (
                  <input
                    type="text"
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input outline-none"
                    placeholder="Enter your answer..."
                  />
                )}

                {/* Long Answer */}
                {q.type === "long answer" && (
                  <textarea
                    rows={4}
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input outline-none resize-none"
                    placeholder="Enter your detailed answer..."
                  />
                )}

                {/* Exercise */}
                {q.type === "exercise" && (
                  <textarea
                    rows={5}
                    value={answers[index] || ""}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-full p-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-input outline-none font-mono text-sm"
                    placeholder="Write your code here..."
                  />
                )}

                <p className="text-sm text-muted-foreground italic border-t pt-4 mt-4">
                  {q.reasoning}
                </p>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={!allAnswered}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-md"
          >
            Submit Quiz
          </button>
        </form>
      </div>
    </div>
  );
}
