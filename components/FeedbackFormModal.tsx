import { z } from 'zod';
import { FC, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

const feedbackSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  message: z.string(),
});

interface FeedbackFormProps {
  open: boolean;
  setOpen: any;
}

// Shared visual language for text-style inputs across this form (matches the
// search/filter inputs on the homepage — see EventsDisplay.tsx).
const fieldClasses =
  'w-full rounded-sm border border-input bg-background-secondary px-3 text-foreground placeholder:text-muted-foreground';

const FeedBackFormModal: FC<FeedbackFormProps> = ({ open, setOpen }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    // Validate the form data before showing a spinner for a request we're
    // not going to send.
    const result = await feedbackSchema.safeParseAsync({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    });

    if (!result.success) {
      toast.error(z.prettifyError(result.error));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/feedback', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      toast.success(data.message);
      setLoading(false);
      setOpen(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Could not submit form');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-section">Hi There 👋</DialogTitle>
            <DialogDescription>
              Something not right, or an idea to make the site better?
              We&apos;d love to hear it.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="name"
            >
              What&apos;s Your Name?
            </label>
            <p className="text-note text-muted-foreground">Optional.</p>
            <input
              name="name"
              id="name"
              className={`${fieldClasses} h-11`}
              placeholder="Frankie Loves Pizzas..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="email"
            >
              Where Shall We Email A Reply?
            </label>
            <p className="text-note text-muted-foreground">Optional.</p>
            <input
              name="email"
              id="email"
              type="email"
              className={`${fieldClasses} h-11`}
              placeholder="frankie@pizzalovers.com..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="message"
            >
              What&apos;s Your Message? <span className="text-destructive">*</span>
            </label>
            <textarea
              name="message"
              id="message"
              placeholder="I love pizza! Please create me an account (P.S. I own a venue)..."
              className={`${fieldClasses} h-32 py-2`}
            />
          </div>

          <DialogFooter>
            {loading ? (
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-foreground" />
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Submit
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedBackFormModal;
