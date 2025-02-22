import { Button, buttonVariants } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Cover } from '@/components/ui/cover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ArrowRight,
	BarChart,
	Book,
	Globe,
	Scale,
	Search,
	Users,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
	return (
		<div className='flex flex-col min-h-screen'>
			{/* Hero Section */}
			<section className='relative flex items-center justify-center text-center px-6 py-24 md:py-40 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950'>
				<div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.1),_transparent)]'></div>
				<div className='container mx-auto max-w-4xl relative z-10'>
					<h1 className='leading-10 text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-yellow-500 to-purple-200 text-transparent bg-clip-text'>
						Democratizing Legal Counselling at <Cover>warp speed</Cover>
					</h1>
					<p className='text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8'>
						Empowering individuals with AI-driven legal insights in their
						preferred language. Your rights, your language, your power.
					</p>

					<Link href='/chat' className={buttonVariants({ size: 'lg' })}>
						Get Started
					</Link>
				</div>
			</section>

			{/* Statistics Section */}
			<section className='py-16 px-4 bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-950'>
				<div className='container mx-auto max-w-6xl'>
					<div className='grid gap-8 md:grid-cols-3'>
						{[
							{ title: '1.3M', desc: 'Lawyers in India' },
							{ title: '30%', desc: 'Non-practicing Lawyers' },
							{ title: '24/7', desc: 'AI-Powered Access' },
						].map((stat, index) => (
							<Card
								key={index}
								className='bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all rounded-lg p-6'
							>
								<CardHeader>
									<CardTitle className='text-4xl font-bold text-yellow-600 dark:text-yellow-400'>
										{stat.title}
									</CardTitle>
									<CardDescription>{stat.desc}</CardDescription>
								</CardHeader>
								<CardContent>
									<p className='text-sm text-gray-600 dark:text-gray-300'>
										Providing real-time access to critical legal information and
										insights.
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Problems & Solutions Section */}
			<section className='py-16 px-4'>
				<div className='container mx-auto max-w-6xl'>
					<Tabs defaultValue='problems' className='space-y-8'>
						<TabsList className='grid w-full md:w-auto grid-cols-2'>
							<TabsTrigger value='problems'>Problems</TabsTrigger>
							<TabsTrigger value='solutions'>Solutions</TabsTrigger>
						</TabsList>
						<TabsContent value='problems' className='space-y-4'>
							<div className='grid gap-6 md:grid-cols-2'>
								<Card>
									<CardHeader>
										<Users className='w-8 h-8 text-primary mb-2' />
										<CardTitle>Language Barriers</CardTitle>
										<CardDescription>
											Many individuals struggle to understand their legal rights
											due to language barriers and complex legal jargon.
										</CardDescription>
									</CardHeader>
								</Card>
								<Card>
									<CardHeader>
										<Search className='w-8 h-8 text-primary mb-2' />
										<CardTitle>Manual Research</CardTitle>
										<CardDescription>
											Lawyers spend significant time on manual research and
											summarizing client cases.
										</CardDescription>
									</CardHeader>
								</Card>
							</div>
						</TabsContent>
						<TabsContent value='solutions' className='space-y-4'>
							<div className='grid gap-6 md:grid-cols-2'>
								<Card>
									<CardHeader>
										<Globe className='w-8 h-8 text-primary mb-2' />
										<CardTitle>Multilingual Support</CardTitle>
										<CardDescription>
											Legal information is available in multiple languages for
											broader accessibility.
										</CardDescription>
									</CardHeader>
								</Card>
								<Card>
									<CardHeader>
										<BarChart className='w-8 h-8 text-primary mb-2' />
										<CardTitle>AI-Driven Insights</CardTitle>
										<CardDescription>
											LLM + RAG integration provides accurate and contextual
											legal information.
										</CardDescription>
									</CardHeader>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</section>

			{/* Benefits Section */}
			<section className='py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950'>
				<div className='container mx-auto max-w-6xl'>
					<h2 className='text-3xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-500 to-purple-200 text-transparent bg-clip-text'>
						Key Benefits
					</h2>
					<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
						{[
							{
								icon: Users,
								title: 'Empowering Individuals',
								desc: 'Easy access to legal rights and duties in native language',
							},
							{
								icon: Book,
								title: 'Efficient Understanding',
								desc: 'AI-generated case summaries for clients and lawyers',
							},
							{
								icon: Search,
								title: 'Faster Research',
								desc: 'Quick access to case laws and legal precedents',
							},
							{
								icon: Scale,
								title: 'Better Decisions',
								desc: 'Relevant legal pathways suggested based on queries',
							},
						].map((benefit, index) => (
							<Card
								key={index}
								className='shadow-md hover:shadow-lg transition-all p-6 rounded-lg'
							>
								<CardHeader>
									<benefit.icon className='w-8 h-8 text-yellow-500 mb-2' />
									<CardTitle>{benefit.title}</CardTitle>
									<CardDescription>{benefit.desc}</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
