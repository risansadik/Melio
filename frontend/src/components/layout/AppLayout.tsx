import { ReactNode } from 'react';
import { Navbar } from './Navbar';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-pantry-700/10 py-6 text-center text-sm text-pantry-700">
        Built with the Spoonacular API. Not affiliated with Spoonacular.
      </footer>
    </div>
  );
};
