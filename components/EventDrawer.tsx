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
        <DrawerContent className='bg-background text-foreground flex flex-col rounded-t-[30px] mt-24 h-[60%] fixed bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-0 lg:top-0 lg:h-full outline-hidden border-2 border-foreground'>
          <div className='h-4 border-b-2 border-foreground'></div>
          <div className='px-4 py-2 rounded-t-[10px] flex-1 overflow-y-auto'>
            <div className='max-w-md mx-auto '>
              {/* <div
                aria-hidden
                className='bg-black mx-auto w-12 h-1.5 shrink-0 rounded-full mb-8'
              /> */}
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
