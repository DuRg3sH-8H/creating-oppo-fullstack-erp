"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, X, Minimize2, Maximize2, MessageSquare } from "lucide-react"
import { useTheme } from "@/components/theme-context"
import { cn } from "@/lib/utils"

// FAQ categories and items
const faqData = [
  {
    category: "General",
    items: [
      {
        question: "What is the School ERP System?",
        answer:
          "The School ERP System is a comprehensive platform designed to streamline school management processes, including student information management, academic tracking, extracurricular activities, ISO compliance, and other educational administrative functions.",
      },
      {
        question: "Who can use the School ERP System?",
        answer:
          "The system is designed for various stakeholders in the educational ecosystem, including school administrators, teachers, students, and parents. Different user roles have access to different features based on their responsibilities.",
      },
      {
        question: "Is my data secure on the School ERP System?",
        answer:
          "Yes, we implement robust security measures to protect your data. All information is encrypted, and we follow industry best practices for data protection. For more details, please refer to our Privacy Policy.",
      },
    ],
  },
  {
    category: "Account Management",
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Accounts are typically created by school administrators. If you're a school administrator setting up the system, you can register your school and create your admin account from the registration page. For teachers, students, and parents, accounts are created by the school administrator.",
      },
      {
        question: "I forgot my password. How can I reset it?",
        answer:
          "You can reset your password by clicking on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password. If you don't receive the email, please check your spam folder or contact your school administrator.",
      },
      {
        question: "How do I update my profile information?",
        answer:
          "You can update your profile information by navigating to the Settings page after logging in. From there, you can edit your personal details, change your password, and adjust notification preferences.",
      },
    ],
  },
  {
    category: "Features & Tools",
    items: [
      {
        question: "What is Nepali Patro and how do I use it?",
        answer:
          "Nepali Patro is a Nepali calendar that helps you track dates according to the Nepali calendar system. You can access it from the footer of any page in the system. It's particularly useful for planning school activities around Nepali holidays and festivals.",
      },
      {
        question: "How does the Unicode Converter work?",
        answer:
          "The Unicode Converter allows you to convert text between various Nepali fonts and Unicode. This is useful for ensuring compatibility when working with Nepali text across different systems. Access it from the footer and paste your text to convert it.",
      },
      {
        question: "Can I integrate Google Meet with the School ERP System?",
        answer:
          "Yes, you can quickly access Google Meet from the footer of any page. This makes it convenient to start or join virtual meetings for classes, parent-teacher conferences, or administrative discussions.",
      },
    ],
  },
  {
    category: "Student Management",
    items: [
      {
        question: "How do I add a new student to the system?",
        answer:
          "School administrators can add new students by navigating to the Students page and clicking on the 'Add Student' button. Fill in the required information in the form, including personal details, class/section assignment, and contact information.",
      },
      {
        question: "Can I import multiple students at once?",
        answer:
          "Yes, you can bulk import students using a CSV or Excel file. Go to the Students page and look for the 'Import Students' option. Download the template, fill it with student data, and upload it back to the system.",
      },
      {
        question: "How do I transfer a student to a different class or section?",
        answer:
          "To transfer a student, go to the student's profile, click on 'Edit', and update their class and section information. The system will automatically update all relevant records to reflect this change.",
      },
    ],
  },
  {
    category: "Technical Support",
    items: [
      {
        question: "The system is running slowly. What should I do?",
        answer:
          "If the system is running slowly, try clearing your browser cache and cookies, or try using a different browser. If the issue persists, it might be due to your internet connection or temporary server load. If the problem continues, please contact our technical support team.",
      },
      {
        question: "I found a bug in the system. How do I report it?",
        answer:
          "You can report bugs by clicking on the 'Contact Support' link at the bottom of the sidebar. Provide a detailed description of the issue, including steps to reproduce it, and any error messages you received. Screenshots are also helpful.",
      },
      {
        question: "Is there a mobile app for the School ERP System?",
        answer:
          "Currently, the School ERP System is optimized for web browsers on both desktop and mobile devices. While there isn't a dedicated mobile app, the responsive design ensures a good experience on smartphones and tablets.",
      },
    ],
  },
]

// Flatten all questions for easy access
const allQuestions = faqData.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    category: category.category,
  })),
)

// Initial greeting message
const initialMessage: Message = {
  type: "bot",
  content:
    "Hello! I'm your School ERP Assistant. How can I help you today? You can ask me any questions about the system or select from the common questions below.",
  timestamp: new Date(),
}

// Initial suggested questions
const initialSuggestedQuestions = faqData[0].items.map((item) => ({
  text: item.question,
  category: faqData[0].category,
}))

type Message = {
  type: "user" | "bot"
  content: string
  timestamp: Date
  isTyping?: boolean
}

type SuggestedQuestion = {
  text: string
  category: string
}

export function ChatbotPopup() {
  useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>(initialSuggestedQuestions)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  // Listen for custom event to open chatbot
  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true)
      setIsMinimized(false)
    }

    window.addEventListener("open-chatbot", handleOpenChatbot)
    return () => {
      window.removeEventListener("open-chatbot", handleOpenChatbot)
    }
  }, [])

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node) && isOpen && !isMinimized) {
        setIsMinimized(true)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isMinimized])

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true)
      setIsMinimized(false)
    } else {
      if (isMinimized) {
        setIsMinimized(false)
      } else {
        setIsMinimized(true)
      }
    }
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const matchedQuestion = findMatchingQuestion(input)

      if (matchedQuestion) {
        // Add bot response
        const botMessage: Message = {
          type: "bot",
          content: matchedQuestion.answer,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Update suggested questions to show questions from the same category
        const categoryQuestions = getCategoryQuestions(matchedQuestion.category)
        setSuggestedQuestions(categoryQuestions)
      } else {
        // No match found
        const botMessage: Message = {
          type: "bot",
          content:
            "I'm sorry, I don't have an answer for that specific question. Here are some related questions that might help:",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Update suggested questions to show random ones
        const randomQuestions = getRandomQuestions(3)
        setSuggestedQuestions(randomQuestions)
      }

      setIsTyping(false)
    }, 1000)
  }

  const handleQuestionClick = (question: string, category: string) => {
    if (isTyping) return

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: question,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const matchedQuestion = allQuestions.find((q) => q.question === question)

      if (matchedQuestion) {
        // Add bot response
        const botMessage: Message = {
          type: "bot",
          content: matchedQuestion.answer,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Update suggested questions to show questions from the same category
        const categoryQuestions = getCategoryQuestions(matchedQuestion.category)
        setSuggestedQuestions(categoryQuestions)
      }

      setIsTyping(false)
    }, 1000)
  }

  const findMatchingQuestion = (input: string) => {
    const lowerInput = input.toLowerCase()

    // Try to find an exact match first
    const exactMatch = allQuestions.find((q) => q.question.toLowerCase() === lowerInput)

    if (exactMatch) return exactMatch

    // Try to find a partial match
    const partialMatch = allQuestions.find(
      (q) => q.question.toLowerCase().includes(lowerInput) || lowerInput.includes(q.question.toLowerCase()),
    )

    if (partialMatch) return partialMatch

    // Try to find a keyword match
    const keywordMatch = allQuestions.find((q) => {
      const keywords = q.question.toLowerCase().split(" ")
      return keywords.some((keyword) => keyword.length > 3 && lowerInput.includes(keyword))
    })

    return keywordMatch
  }

  const getCategoryQuestions = (category: string): SuggestedQuestion[] => {
    const categoryData = faqData.find((c) => c.category === category)
    if (!categoryData) return []

    return categoryData.items
      .map((item) => ({
        text: item.question,
        category: categoryData.category,
      }))
      .filter((q) => !messages.some((m) => m.type === "user" && m.content === q.text))
      .slice(0, 3)
  }

  const getRandomQuestions = (count: number): SuggestedQuestion[] => {
    const askedQuestions = messages.filter((m) => m.type === "user").map((m) => m.content)

    const availableQuestions = allQuestions.filter((q) => !askedQuestions.includes(q.question))

    // Shuffle and take the first 'count' questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random())

    return shuffled.slice(0, count).map((q) => ({
      text: q.question,
      category: q.category,
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectCategory = (category: string) => {
    const categoryData = faqData.find((c) => c.category === category)
    if (!categoryData) return

    const categoryQuestions = categoryData.items.map((item) => ({
      text: item.question,
      category: categoryData.category,
    }))

    setSuggestedQuestions(categoryQuestions)

    // Add a bot message indicating category change
    const botMessage: Message = {
      type: "bot",
      content: `Here are some questions about ${category}:`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center",
          isOpen && !isMinimized
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-[var(--primary-color)] hover:bg-[var(--accent-color)]",
        )}
        aria-label="Chat with assistant"
      >
        {isOpen && !isMinimized ? (
          <Minimize2 className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className={cn(
            "fixed z-40 transition-all duration-300 shadow-xl border border-gray-200 rounded-lg overflow-hidden text-black",
            isMinimized ? "bottom-20 right-6 w-72 h-14" : "bottom-20 right-6 w-80 sm:w-96 h-[600px] max-h-[80vh]",
          )}
        >
          {/* Chat Header */}
          <div className="bg-[var(--primary-color)] text-white p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <h2 className="font-medium">School ERP Assistant</h2>
            </div>
            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              )}
              {isMinimized && (
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  aria-label="Maximize"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={closeChat}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Categories */}
              <div className="bg-gray-50 p-2 border-b border-gray-200 flex overflow-x-auto gap-1 text-xs">
                {faqData.map((category) => (
                  <button
                    key={category.category}
                    onClick={() => selectCategory(category.category)}
                    className="px-2 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100 whitespace-nowrap"
                  >
                    {category.category}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="p-3 overflow-y-auto bg-gray-50" style={{ height: "calc(100% - 120px)" }}>
                {messages.map((message, index) => (
                  <div key={index} className={cn("mb-3 max-w-[85%]", message.type === "user" ? "ml-auto" : "mr-auto")}>
                    <div
                      className={cn(
                        "rounded-lg p-2 text-sm",
                        message.type === "user"
                          ? "bg-[var(--primary-color)] text-white rounded-tr-none"
                          : "bg-white border border-gray-200 rounded-tl-none",
                      )}
                    >
                      <div className="flex items-start mb-1">
                        {message.type === "bot" ? (
                          <Bot className="h-4 w-4 mr-1 text-[var(--primary-color)]" />
                        ) : (
                          <User className="h-4 w-4 mr-1 text-white" />
                        )}
                        <span className="font-medium text-xs">{message.type === "bot" ? "Assistant" : "You"}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={cn(
                          "text-xs mt-1 text-right",
                          message.type === "user" ? "text-white/70" : "text-gray-500",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="mb-3 max-w-[85%]">
                    <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-2">
                      <div className="flex items-center space-x-1">
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested questions */}
                {!isTyping && suggestedQuestions.length > 0 && (
                  <div className="my-3">
                    <p className="text-xs text-gray-500 mb-1">Suggested questions:</p>
                    <div className="flex flex-col gap-1">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuestionClick(q.text, q.category)}
                          className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                        >
                          {q.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here..."
                    className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] resize-none text-sm"
                    rows={1}
                    style={{ maxHeight: "80px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "bg-[var(--primary-color)] text-white p-2 rounded-r-lg",
                      !input.trim() || isTyping ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--accent-color)]",
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
