import { eventService } from "@/infrastructure/event/event.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { redis } from "../redis";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

eventService.subscribe("upload-pdf", async (event) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
# Role and purpose
  
Your goal is to create questions that evaluate comprehensive understanding of core concepts, key arguments, and fundamental principles from the provided document. These questions should go beyond surface-level recall and require students to apply their knowledge in meaningful ways.

# Question Types and Guidelines:

1. Multiple Choice Questions (2-3 questions)
   - Present scenarios requiring application of document concepts
   - Include 4-5 options, with plausible distractors testing common misconceptions
   - Require analysis rather than mere recall

2. True/False Questions (1-2 questions)
   - Present nuanced statements testing understanding of subtle distinctions
   - Use compound statements that require evaluating multiple concepts


3. Short Answer Questions (2-3 questions)
   - Ask for explanations, comparisons, or applications
   - Require synthesis of multiple concepts
   - Should be answerable in 2-3 sentences

4. Long Answer Questions (1-2 questions)
   - Request analysis of arguments or evaluation of evidence
   - Require application of concepts to new situations
   - Should require 1-2 paragraphs for complete answers

5. Exercise (1 question)
   - Create a question that tests the student's ability to apply the document's concepts to a new situation or propose solutions to problems

# Assessment Criteria

Required:
- Questions must test application rather than memorization
- Include real-world scenarios where possible
- Test understanding of relationships between concepts
- Evaluate ability to apply principles in new contexts
- Cover key concepts that impact understanding of later material

Forbidden:
- Surface-level recall questions
- Questions about formatting or presentation
- Questions about author opinions unless central to understanding
- Trivial details that don't affect comprehension
- Questions answerable without understanding the material

# Output format

The answer should be a JSON object with the following structure:
  {
    "questions": [
      {
        "reasoning": "I'm asking this question because...",
        "type": "multiple choice",
        "question": "What is the main topic of the document?",
        "options": ["Spaghetti", "Pizza", "Lasagna", "Rice"],
        "answer": "Spaghetti"
      },
      {
       "reasoning": "I'm asking this question because...",
        "type": "true/false",
        "question": "Is the document about a new product?",
        "answer": "True"
      },
      {
       "reasoning": "I'm asking this question because...",
        "type": "short answer",
        "question": "What is the main topic of the document?",
        "answer": "Spaghetti"
      },
      {
       "reasoning": "I'm asking this question because...",
        "type": "long answer",
        "question": "What is the main topic of the document?",
        "answer": "The main topic of the document is spaghetti."
      },
    ]
  }

  The answer should only contain the JSON object, nothing else.
  `;

  const response = await model.generateContent([
    {
      text: prompt,
    },
    {
      fileData: {
        fileUri: event.uri,
        mimeType: event.mimeType,
      },
    },
  ]);

  // remove the ```json and ``` from the response
  const responseText = response.response
    .text()
    .replace("```json", "")
    .replace("```", "");

  const questionsJson = JSON.parse(responseText);

  await redis.set(event.uri, JSON.stringify(questionsJson));
  await redis.del(`generating-questions:${event.uri}`);
});

eventService.subscribe("rate-answers", async ({ answers, uri }) => {
  console.log("rating answers", answers, uri);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
  # Role and purpose
  
  Given a document, a list of questions on it and a list of answers to the questions, rate the answers. Each correct answer gives 1 point. For each incorrect answer, you should return a reasoning of why it is incorrect.

  Along with the scores, you will return a short feedback of the user's performance.

  You will also return the key concept that the user didn't grasped and an explanation on those key concepts. A simple one that is super easy to understand.


  # Input format

  question_1: Lorem ipsum dolor sit amet, consectetur adipiscing elit?
  answer_1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  question_2: Lorem ipsum dolor sit amet, consectetur adipiscing elit?
  answer_2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  question_3: Lorem ipsum dolor sit amet, consectetur adipiscing elit?
  answer_3: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  
  # Output format
  You will return a JSON object with the following structure:
  {
    "scores": [
      {
        "score": 1,
      },
      {
        "score": 0,
        "reasoning": "The answer is incorrect because..."
      }
    ],
    "feedback": "You did great! You got 3/10 questions correct. Keep up the good work!",
    "improvement": "You should focus on understanding the key concepts of the document. You didn't grasp the concept of Lorem ipsum dolor sit amet, consectetur adipiscing elit. A simple explanation is that it is a type of pasta."
  }


  Now, here are the questions and answers:
  ${answers
    .map(
      (answer, index) =>
        `question_${index + 1}: ${answer.question}
          answer_${index + 1}: ${answer.answer}`
    )
    .join("\n")}
  `;

  const response = await model.generateContent([
    {
      text: prompt,
    },
    {
      fileData: {
        fileUri: uri,
        mimeType: "application/pdf",
      },
    },
  ]);

  console.log("response", response.response.text());

  // remove the ```json and ``` from the response
  const responseText = response.response
    .text()
    .replace("```json", "")
    .replace("```", "");

  const questionsJson = JSON.parse(responseText);

  await redis.set(uri, JSON.stringify(questionsJson));
  await redis.del(`rate-answers:${uri}`);
});

export { eventService };
