
import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Play, Download, Share2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CppIde = () => {
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('Ready to run your code...');
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const editorRef = useRef(null);

  const STORAGE_KEY = "cpp-ide-code";

  const defaultCode = `/**
 * All Praise to Allah
 * ---------------------
 * Author: Al Kayes Rifat
 * Portfolio: alkayesrifat.netlify.app
 * ---------------------
 */

#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cout << "Assalamualaikum. I am Al Kayes Rifat";

    return 0;
}`;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || defaultCode;
    setCode(saved);
    
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add Ctrl+Enter shortcut using proper Monaco keybinding
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("⚡ Executing your code...");
    
    if (isMobileView) {
      setShowOutput(true);
    }

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "cpp",
          version: "10.2.0",
          files: [{ name: "main.cpp", content: code }],
          stdin: input
        })
      });

      const result = await response.json();
      setOutput(result.run.stdout || result.run.stderr || "✅ Program executed successfully with no output.");
    } catch (error) {
      setOutput("❌ Connection failed. Please check your internet and try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "main.cpp";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      window.open("https://codeshare-al-kayes.netlify.app/", "_blank");
    } catch (error) {
      // Silently handle error
      window.open("https://codeshare-al-kayes.netlify.app/", "_blank");
    }
  };

  const MobilePanel = ({ title, isVisible, onToggle, children }: {
    title: string;
    isVisible: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700 transition-colors"
      >
        <span className="font-medium text-slate-200">{title}</span>
        <div className={`transition-transform duration-200 ${isVisible ? 'rotate-45' : ''}`}>
          {isVisible ? <X size={18} className="text-slate-400" /> : <Menu size={18} className="text-slate-400" />}
        </div>
      </button>
      {isVisible && (
        <div className="p-4 border-t border-slate-700 bg-slate-850">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">🚀</div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-100">
                  C++ IDE
                </h1>
                <a 
                  href="https://alkayesrifat.netlify.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-300 transition-colors text-sm font-medium"
                >
                  by Al Kayes Rifat
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={runCode}
                disabled={isRunning}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <Play size={18} className="mr-2" />
                {isRunning ? "Running..." : "Execute"}
              </Button>
              
              <Button
                onClick={downloadCode}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <Download size={18} className="mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              
              <Button
                onClick={shareCode}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200"
              >
                <Share2 size={18} className="mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 border border-slate-700 rounded-lg overflow-hidden bg-slate-800">
            <MonacoEditor
              height="100%"
              language="cpp"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: fontSize,
                minimap: { enabled: !isMobileView },
                lineNumbers: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: isMobileView ? "on" : "off",
                folding: true,
                bracketMatching: "always",
                autoIndent: "full",
                fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: false,
              }}
            />
          </div>
        </div>

        {/* Desktop Right Panel */}
        {!isMobileView && (
          <div className="w-80 flex flex-col p-4 space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <label className="block text-sm font-medium mb-3 text-slate-200">
                💾 Input (Optional)
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                className="bg-slate-750 border-slate-600 text-slate-100 placeholder:text-slate-400 resize-none h-24 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
              />
            </div>
            
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col">
              <label className="block text-sm font-medium mb-3 text-slate-200">
                📤 Output
              </label>
              <pre className="bg-slate-750 border border-slate-600 rounded-md p-4 text-sm text-slate-100 whitespace-pre-wrap overflow-auto flex-1 font-mono">
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Panels */}
      {isMobileView && (
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <MobilePanel
            title="💾 Input"
            isVisible={showInput}
            onToggle={() => setShowInput(!showInput)}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input here..."
              className="bg-slate-750 border-slate-600 text-slate-100 placeholder:text-slate-400 resize-none h-20 w-full rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
            />
          </MobilePanel>

          <MobilePanel
            title="📤 Output"
            isVisible={showOutput}
            onToggle={() => setShowOutput(!showOutput)}
          >
            <pre className="bg-slate-750 border border-slate-600 rounded-md p-4 text-sm text-slate-100 whitespace-pre-wrap overflow-auto max-h-48 font-mono">
              {output}
            </pre>
          </MobilePanel>
        </div>
      )}
    </div>
  );
};

export default CppIde;
