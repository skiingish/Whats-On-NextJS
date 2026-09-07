import { z } from 'zod';
import { FC, useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VenueComboBox } from './ui/VenueComboBox';
import { isNewVenue, newVenueName } from '@/lib/venue-selection';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { cn } from '@/lib/utils';

// Fields match what's actually collected from this form (see handleFormSubmit
// below) — venue selection is a combobox validated separately, since it's
// controlled state rather than a plain form field, and "when" is built
// server-side by joining the selected `days`.
const eventsSchema = z.object({
  desc: z.string().trim().min(1, 'Please describe the special'),
  special_price: z.string().trim().nullable().optional(),
  event_time: z.string().trim().min(1, 'Please add a time'),
  days: z.array(z.string()).min(1, 'Please select at least one day'),
});

interface AddSpecialModalProps {
  event: Events | null;
  open: boolean;
  setOpen: any;
  userLoggedIn?: boolean | null;
}

// Was seven copy-pasted <label>/<input>/<div> blocks, one per day, each
// carrying an identical ~400-character class string (tech debt D9). Mapping
// over this array is the single source of truth for both the day list and
// its markup.
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

// Shared visual language for text-style inputs across this form (matches the
// search/filter inputs on the homepage — see EventsDisplay.tsx).
const fieldClasses =
  'h-11 w-full rounded-sm border border-input bg-background-secondary px-3 text-foreground placeholder:text-muted-foreground';

const AddSpecialModal: FC<AddSpecialModalProps> = ({
  event,
  open,
  setOpen,
  userLoggedIn,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState('');
  // Purely presentational state driving the day chips below — the actual
  // submitted value is still the "days" checkbox-shaped hidden inputs
  // rendered per selected day, so form submission is unchanged.
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedVenue) {
      toast.error('Please select or add a venue');
      return;
    }

    const formData = new FormData(e.currentTarget);

    const result = eventsSchema.safeParse({
      desc: formData.get('desc'),
      special_price: formData.get('special_price'),
      event_time: formData.get('event_time'),
      days: formData.getAll('days'),
    });

    if (!result.success) {
      toast.error(z.prettifyError(result.error));
      return;
    }

    setLoading(true);

    try {
      // A venue the visitor named themselves doesn't exist yet, so send the
      // name rather than an id and let an admin create it on approval.
      if (isNewVenue(selectedVenue)) {
        formData.delete('venue_id');
        formData.set('venue_name', newVenueName(selectedVenue));
      } else {
        formData.set('venue_id', selectedVenue);
      }

      const response = await fetch('/events', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit event');
      }

      setLoading(false);
      setSelectedVenue('');
      setSelectedDays([]);
      setOpen(false);

      if (userLoggedIn) {
        toast.success('Event added!');
      } else {
        toast.success('Event submitted for approval!');
      }
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
            <DialogTitle className="text-section">
              {userLoggedIn ? 'Add Event' : 'Add New Event For Review'}
            </DialogTitle>
            <DialogDescription>
              {userLoggedIn
                ? 'Add a new special — it goes live immediately.'
                : "Tell us about a special that isn't listed yet. An admin will review it before it appears."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="venue">
              Where <span className="text-destructive">*</span>
            </label>
            <VenueComboBox
              id="venue"
              value={selectedVenue}
              onChange={setSelectedVenue}
              canCreateVenue={!!userLoggedIn}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="desc">
              What <span className="text-destructive">*</span>
            </label>
            <input
              className={fieldClasses}
              id="desc"
              name="desc"
              required
              placeholder="Cheap Tuesdays..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="special_price"
            >
              Special $ Details
            </label>
            <p className="text-note text-muted-foreground">Optional.</p>
            <input
              className={fieldClasses}
              id="special_price"
              name="special_price"
              placeholder="$5 Cheese Pizzas..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground" htmlFor="event_time">
              Time <span className="text-destructive">*</span>
            </label>
            <input
              className={fieldClasses}
              id="event_time"
              name="event_time"
              required
              placeholder="All day..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              When <span className="text-destructive">*</span>
            </span>
            <p className="text-note text-muted-foreground">Select all that apply.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS.map((day) => {
                const selected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'min-h-11 min-w-11 rounded-full border px-4 text-sm font-semibold tracking-wide transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background-secondary text-foreground hover:bg-muted'
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {selectedDays.map((day) => (
              <input key={day} type="hidden" name="days" value={day} />
            ))}
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

export default AddSpecialModal;
