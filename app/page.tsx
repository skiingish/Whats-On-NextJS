import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'
import Logo from '../components/Logo'
import EventsDisplay from '@/components/EventsDisplay'

export const dynamic = 'force-dynamic'

export default async function Index() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
    let { data: events} = await supabase.from('events').select()
  
  return (
    <div className="w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      
      
      <div className="animate-in flex flex-col gap-8 opacity-0 max-w-4xl px-3 py-8 lg:py-12 text-foreground">
        <div className="flex flex-col items-center mb-4 lg:mb-12">
          <div className="flex gap-4 justify-center items-center">
            <Logo />
          </div>
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center my-4">
            Whats On Today!
          </p>
          {/* <div className="bg-foreground py-3 px-6 rounded-lg font-mono text-sm text-background">
            Get started by editing <strong>app/page.tsx</strong>
          </div> */}
        </div>

        {/* <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" /> */}

        {/* <div className="flex flex-col gap-8 text-foreground">
          <h2 className="text-lg font-bold text-center">
            Everything you need to get started
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {resources.map(({ title, subtitle, url, icon }) => (
              <a
                key={title}
                className="relative flex flex-col group rounded-lg border p-6 hover:border-foreground"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <h3 className="font-bold mb-2  min-h-[40px] lg:min-h-[60px]">
                  {title}
                </h3>
                <div className="flex flex-col grow gap-4 justify-between">
                  <p className="text-sm opacity-70">{subtitle}</p>
                  <div className="flex justify-between items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="opacity-80 group-hover:opacity-100"
                    >
                      <path
                        d={icon}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div> */}

        {/* <div className="flex flex-col gap-8 text-foreground">
          <div className="grid gap-2 justify-center mx-auto text-center">
            <h2 className="text-lg font-bold text-center">Examples</h2>
            <p className="text-sm">
              Look in the <code>_examples</code> folder to see how to create a
              Supabase client in all the different contexts.
            </p>
          </div>
          <div className="w-full justify-center border rounded-lg overflow-hidden">
            {examples.map(({ type, src }) => (
              <div
                key={type}
                className="w-full grid grid-cols-3 border-b last:border-b-0 text-sm"
              >
                <div className="flex items-center font-bold p-4 min-h-12 w-full">
                  {type}
                </div>
                <div className="col-span-2 border-l p-4 flex items-center">
                  <code className="text-sm whitespace-pre-wrap">{src}</code>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* <AddSpecialModal/> */}

        

        <div>
          <p className='py-4' >Add New</p>
          <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action="/events"
        method="post">
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
          {/*           
          <input className="rounded-md px-4 py-2 bg-inherit border mb-6" 
          name="when"
          required
          /> */}
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

      </div>
      
      <div className="animate-in w-full gap-8 opacity-0 max-w-4xl py-8 lg:py-12 px-8 text-foreground">
        <EventsDisplay events={events || []}/>
      </div>

    </div>
  )
}
