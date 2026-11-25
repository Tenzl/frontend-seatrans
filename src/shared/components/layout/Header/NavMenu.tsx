'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/components/ui/navigation-menu'
import { MenuItem } from './menuData'
import { cn } from '@/shared/lib/utils'

interface NavMenuProps {
  menu: MenuItem[]
  /** Render nav text in white for use over a transparent header on top of the hero. */
  light?: boolean
}

export default function NavMenu({ menu, light = false }: NavMenuProps) {
  const pathname = usePathname()

  const lightItem = light
    ? 'text-white/85 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white'
    : ''

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menu.map((item) => (
          <NavigationMenuItem key={item.id}>
            {item.subMenu && item.subMenu.length > 0 ? (
              <>
                <NavigationMenuTrigger className={cn('bg-transparent text-sm font-medium', lightItem)}>
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.subMenu.map((child) => (
                      <li key={child.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.path ?? '#'}
                            className={cn(
                              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                              pathname === child.path && 'bg-accent/50'
                            )}
                          >
                            <div className="flex items-center gap-2 text-sm font-medium leading-none">
                              {child.icon && <child.icon className="h-4 w-4 text-primary" />}
                              {child.title}
                            </div>
                            {child.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                                {child.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.path ?? '#'}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'bg-transparent text-sm font-medium',
                    lightItem,
                    pathname === item.path && (light ? 'text-white' : 'text-primary')
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
