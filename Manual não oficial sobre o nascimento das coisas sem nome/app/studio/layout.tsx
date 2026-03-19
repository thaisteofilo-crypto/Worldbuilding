import { SidebarNav } from '@/components/studio/SidebarNav';
import { AIPromptBox } from '@/components/ui/ai-prompt-box';

export default function StudioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[#FAFAF9] overflow-hidden">
            <SidebarNav />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
                <AIPromptBox />
            </div>
        </div>
    );
}
