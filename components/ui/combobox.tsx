'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CommandDialog, CommandLoading, CommandSeparator } from 'cmdk';

interface ComboboxProps {
  options: {
    value: string;
    label: string;
  }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowAddItem?: boolean;
  addItemLabel?: string;
  handleAddItem?: (value: string) => void;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  loadingMessage?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  addItemLabel = 'Add option',
  handleAddItem,
  emptyMessage = 'No option found.',
  className = 'w-full',
  loading = false,
  loadingMessage = 'Fetching options…',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`${className} justify-between`}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={className + ' p-0'}>
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={searchPlaceholder}
          />

          <CommandList>
            {loading && <CommandLoading>{loadingMessage}</CommandLoading>}
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className='flex justify-between items-center w-full'>
                    {option.label}
                    <Check
                      className={cn(
                        'ml-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {handleAddItem && search.length > 0 && (
            <CommandGroup forceMount>
              <CommandItem
                onSelect={() => {
                  handleAddItem(search);
                  setOpen(false);
                }}
              >
                <span className='flex justify-between items-center w-full font-bold'>
                  {`${addItemLabel} ${search}`}
                  <Plus className={'ml-2 h-4 w-4'} />
                </span>
              </CommandItem>
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
