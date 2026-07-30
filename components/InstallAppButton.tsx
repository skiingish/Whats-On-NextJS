'use client';
import * as React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [dismissed, setDismissed] = React.useState(false);

  const hide = () => setDismissed(true);

  // Visible once the browser has actually offered to install, unless the
  // visitor dismissed it — derived directly from `prompt` rather than
  // mirrored into its own state via an effect, which was only ever
  // syncing one piece of state to another with no external system involved.
  const isVisible = !!prompt && !dismissed;

  // if no need for the button, don't render anything.
  if (!isVisible) {
    return <div />;
  }

  return (
    <Button
      variant='secondary'
      size='sm'
      className='h-11 whitespace-nowrap'
      onClick={promptToInstall}
    >
      <Download className='h-4 w-4' /> Install App
    </Button>
  );
}
