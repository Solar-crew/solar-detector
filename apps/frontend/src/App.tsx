import { Button } from './components/ui/button';
import { SunMedium } from 'lucide-react';

export default function App() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-slate-900 to-slate-950 text-white">
      <div className="text-center space-y-4">
        <SunMedium className="w-12 h-12 mx-auto text-yellow-400 animate-pulse" />
        <h1 className="text-3xl font-semibold">Hello from ShadCN + Vite + React ⚡️</h1>
        <p className="text-slate-400">Your frontend is up and running!</p>
        <Button>Get Started</Button>
      </div>
    </main>
  );
}
