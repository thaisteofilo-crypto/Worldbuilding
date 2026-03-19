'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Layout, Users } from 'lucide-react';

const navItems = [
    { id: 'referencias', label: 'Referências', icon: BookOpen, path: '/studio/referencias' },
    { id: 'estrutura', label: 'Estrutura', icon: Layout, path: '/studio/estrutura' },
    { id: 'personagens', label: 'Personagens', icon: Users, path: '/studio/personagens' },
];

export const SidebarNav = () => {
    const pathname = usePathname();

    return (
        <div className="w-[240px] border-r border-gray-100 flex flex-col bg-white flex-shrink-0 shadow-sm z-10">
            <div className="h-[52px] flex items-center px-5 gap-2 border-b border-gray-100">
                <span className="text-[18px] font-bold text-green-600">✦</span>
                <span className="text-[16px] font-extrabold text-gray-900 tracking-tight">MythQuill</span>
                <span className="text-[11px] text-gray-400 font-medium ml-1 mt-0.5 uppercase tracking-wider font-mono">Studio</span>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group',
                                isActive
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            )}
                        >
                            <item.icon className={cn(
                                'w-4.5 h-4.5 transition-colors',
                                isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'
                            )} />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1 h-4 bg-green-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-100 italic text-[11px] text-gray-400 text-center">
                "O Entre nunca se resolve."
            </div>
        </div>
    );
};
