import { FC, useEffect, useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
import { Button } from './ui/button';
import { DialogTitle } from './ui/dialog';

interface EventDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

const EventDrawer: FC<EventDrawerProps> = ({
  open,
  onOpenChange,
  title = '',
  children,
}) => {
  // Match Tailwind's `lg` breakpoint via matchMedia rather than reading
  // window.innerWidth once in the render body — that read only happened at
  // mount (risking a server/client hydration mismatch) and never updated on
  // resize. Same pattern VenueMap uses for its dark-mode media query.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(query.matches);

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => onOpenChange(false)}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPortal>
        <DrawerTitle>{title}</DrawerTitle>
        {/*
          `components/ui/drawer.tsx`'s DrawerContent already supplies the
          raised-surface look this spec calls for: rounded-xl top corners,
          hairline border, shadow, and a grab handle — so only positioning
          (the bottom sheet on mobile vs. the right-hand panel on desktop)
          is added here.
        */}
        <DrawerContent className='text-foreground fixed bottom-0 left-0 right-0 mt-24 h-[60%] outline-hidden lg:bottom-auto lg:left-auto lg:right-0 lg:top-0 lg:h-full lg:max-h-full lg:rounded-l-xl lg:rounded-t-none'>
          <div className='flex-1 overflow-y-auto px-4 py-2'>
            <div className='mx-auto max-w-md'>
              {children}
              <DrawerFooter>
                {/* asChild merges the close trigger into the Button. Without
                    it, DrawerClose renders its own <button> around Button's,
                    which is invalid HTML and trips React 19's DOM validation. */}
                <DrawerClose asChild>
                  <Button className=' w-full'>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
};

export default EventDrawer;
