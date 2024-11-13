import { FC } from 'react';
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

interface EventDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

const EventDrawer: FC<EventDrawerProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerPortal>
        <DrawerContent className='bg-background dark:bg-dark-background text-foreground dark:text-dark-text-foreground flex flex-col rounded-t-[30px] mt-24 h-[80%] lg:h-[320px] fixed bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-0 lg:top-0 outline-none border-2 border-foreground'>
          <div className='p-4 rounded-t-[10px] flex-1 overflow-y-auto'>
            <div className='max-w-md mx-auto '>
              {/* <div
                aria-hidden
                className='bg-black mx-auto w-12 h-1.5 flex-shrink-0 rounded-full mb-8'
              /> */}
              {children}
              <DrawerFooter>
                <DrawerClose>
                  <Button variant='default'>Close</Button>
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
