import { FC } from 'react'

const AddEventDisplay: FC  = () => {

  return (
        <div>
          <form 
            className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
            action="/events"
            method="post"
          >
            <label className='text-md'>Where</label>
            <input className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="venue"
            required
            />
            <label className='text-md'>What</label>
            <input className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="desc"
            required
            />
            <label className='text-md'>$ Special $</label>
            <input className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="special_price"
            required
            />
            <label className='text-md'>Time</label>
            <input className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="event_time"
            required
            />
            
            <label className='text-md'>When</label>
            <div className='flex-1 flex max-w-lg flex-row flex-wrap justify-center gap-6 py-4 text-foreground'>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Monday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Monday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Tuesday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Tuesday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Wednesday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Wednesday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Thursday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Thursday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Friday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Friday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Saturday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Saturday</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name='days' value="Sunday" className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Sunday</span>
              </label>
            </div>
            <button className="bg-green-700 rounded px-4 py-2 text-white mb-2">Submit</button>
          </form>
        </div>
  )
}

export default AddEventDisplay