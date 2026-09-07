import { z } from 'zod';
import { FC, useState, FormEvent } from 'react';
import { dayformatter } from '@/utils/dataformatter';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
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

const issueSchema = z.object({
  eventid: z.number(),
  issueselector: z.string(),
  missinginfotext: z.string().nullable().optional(),
});

interface ReportEventModalProps {
  event: Events | null;
  open: boolean;
  setOpen: any;
}

// Shared visual language for text-style inputs across this form (matches the
// search/filter inputs on the homepage — see EventsDisplay.tsx).
const fieldClasses =
  'w-full rounded-sm border border-input bg-background-secondary px-3 text-foreground placeholder:text-muted-foreground';

const ReportEventModal: FC<ReportEventModalProps> = ({
  event,
  open,
  setOpen,
}) => {
  const [issue, setIssue] = useState<string>('notvaild');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const eventId = event?.id;
    // If no event id is found, then we don't want to submit the form. This
    // guard used to run after setLoading(true) and throw outside the try
    // below, which left the spinner stuck forever with no reachable Cancel
    // button — bail out before touching loading state instead.
    if (!eventId) {
      console.error('No event id found');
      toast.error('Something went wrong — no event to report.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append('eventid', eventId.toString());

    // Validate the form data before showing a spinner for a request we're
    // not going to send.
    const result = await issueSchema.safeParseAsync({
      eventid: eventId,
      issueselector: formData.get('issueselector'),
      missinginfotext: formData.get('missinginfotext'),
    });

    if (!result.success) {
      toast.error(z.prettifyError(result.error));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/issues', {
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

  const venueName =
    typeof event?.venue === 'string' ? event.venue : event?.venue?.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle className="text-section">
              Report Event {venueName ? `— ${venueName}` : ''}
            </DialogTitle>
            <DialogDescription>
              Let us know what&apos;s wrong with this listing and we&apos;ll take
              a look.
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex flex-wrap gap-x-6 gap-y-2 rounded-sm border border-border bg-background-secondary px-4 py-3"
            key={event?.id}
          >
            {venueName && (
              <p className="text-card-title w-full text-foreground">
                {venueName}
              </p>
            )}
            <p className="w-full text-foreground">{event?.desc}</p>
            {event?.special_price !== null ? (
              <p className="text-price text-accent">{event?.special_price}</p>
            ) : null}
            <p className="flex items-center gap-1.5 text-meta text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {dayformatter(event?.when)}
            </p>
            <p className="flex items-center gap-1.5 text-meta text-muted-foreground">
              <Clock className="h-4 w-4" /> {event?.event_time}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="issueselector"
            >
              What would you like to report?
            </label>
            <select
              name="issueselector"
              id="issueselector"
              className={`${fieldClasses} h-11`}
              value={issue}
              onChange={(e) => {
                setIssue(e.target.value);
              }}
            >
              <option value="notvaild">Doesn&apos;t Exist</option>
              <option value="missinginfo">Incorrect Info</option>
            </select>
          </div>

          {issue === 'missinginfo' ? (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="missinginfotext"
              >
                What&apos;s Missing?
              </label>
              <textarea
                name="missinginfotext"
                id="missinginfotext"
                className={`${fieldClasses} h-32 py-2`}
              />
            </div>
          ) : null}

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

export default ReportEventModal;
