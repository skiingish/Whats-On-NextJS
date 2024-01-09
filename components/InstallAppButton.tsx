'use client';
import * as React from 'react';
import { Download } from 'lucide-react';

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function useAddToHomescreenPrompt(): [
  IBeforeInstallPromptEvent | null,
  () => void
] {
  const [prompt, setState] = React.useState<IBeforeInstallPromptEvent | null>(
    null
  );

  const promptToInstall = () => {
    if (prompt) {
      return prompt.prompt();
    }
    return Promise.reject(
      new Error(
        'Tried installing before browser sent "beforeinstallprompt" event'
      )
    );
  };

  React.useEffect(() => {
    const ready = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      setState(e);
    };

    window.addEventListener('beforeinstallprompt', ready as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', ready as any);
    };
  }, []);

  return [prompt, promptToInstall];
}

export default function InstallAppButton() {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt();
  const [isVisible, setVisibleState] = React.useState(false);

  const hide = () => setVisibleState(false);

  React.useEffect(() => {
    if (prompt) {
      setVisibleState(true);
    }
  }, [prompt]);

  // if no need for the button, don't render anything.
  if (!isVisible) {
    return <div />;
  }

  return (
    <button
      className='whitespace-no-wrap py-2 px-4 rounded-full text-foreground border-foreground border-2 bg-btn-background hover:bg-btn-background-hover flex items-center'
      onClick={promptToInstall}
    >
      <Download size={16} className='mr-1' /> Install App
    </button>
  );
}
