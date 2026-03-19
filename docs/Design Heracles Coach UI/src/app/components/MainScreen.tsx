import { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Moon,
  Zap,
  TrendingUp,
  Send,
  User,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { ScreenNavigator } from "./ScreenNavigator";

// Mock data for charts
const sleepData = [
  { value: 7.5 },
  { value: 6.8 },
  { value: 8.2 },
  { value: 7.9 },
  { value: 8.5 },
  { value: 7.2 },
  { value: 8.1 },
];

const strainData = [
  { value: 12 },
  { value: 15 },
  { value: 10 },
  { value: 14 },
  { value: 11 },
  { value: 13 },
  { value: 9 },
];

const recoveryData = [
  { value: 85 },
  { value: 78 },
  { value: 92 },
  { value: 88 },
  { value: 95 },
  { value: 90 },
  { value: 92 },
];

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
}

export function MainScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Good morning, Alex! Your recovery score is excellent today. You're ready for a high-intensity workout.",
    },
    {
      id: 2,
      sender: "user",
      text: "What should I focus on today?",
    },
    {
      id: 3,
      sender: "ai",
      text: "Based on your recovery, prioritize protein intake and avoid high strain today. Consider strength training with moderate intensity.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: "user", text: inputValue },
      ]);
      setInputValue("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-black to-blue-950/20" />

      {/* TOP HALF - User Data Dashboard */}
      <div className="relative z-10 flex-1 p-6 pb-3 space-y-4">
        {/* Header with user info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-purple-500/30">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                A
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-white font-semibold">Alex</h2>
              <p className="text-sm text-green-400">92% recovery</p>
            </div>
          </div>
          <button className="p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
            <User className="w-5 h-5 text-gray-400" />
          </button>
        </motion.div>

        {/* Recovery Score - Large Circular */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-white font-medium">Recovery Score</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </div>

            <div className="flex items-center justify-between">
              <div className="relative w-32 h-32">
                {/* Circular progress */}
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - 0.92)}`}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">92</span>
                </div>
              </div>

              <div className="flex-1 ml-6">
                <div className="space-y-1">
                  <div className="text-sm text-gray-400">7-day trend</div>
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={recoveryData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sleep Quality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Moon className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm text-gray-300">Sleep</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">8.1h</div>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={sleepData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Strain Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm text-gray-300">Strain</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">9.2</div>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={strainData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/20 mt-0.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white mb-1">Ready to perform</div>
              <div className="text-sm text-gray-300">
                You are ready for a moderate workout today
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM HALF - Chat Interface */}
      <div className="relative z-10 flex-1 bg-gradient-to-b from-white/5 to-black/50 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-gray-100"
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Suggestions */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-gray-300 whitespace-nowrap hover:bg-white/10 transition-colors">
            What should I eat?
          </button>
          <button className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-sm text-gray-300 whitespace-nowrap hover:bg-white/10 transition-colors">
            Can I train today?
          </button>
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach..."
            className="flex-1 h-12 bg-white/5 border-white/10 backdrop-blur-xl text-white placeholder:text-gray-500 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          <Button
            onClick={handleSend}
            className="h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScreenNavigator />
    </div>
  );
}