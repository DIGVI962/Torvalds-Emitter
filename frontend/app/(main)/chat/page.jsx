'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TiptapViewer from '@/components/TiptapViewer';
import { Select } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { languages } from '../../../lib/langconf';
import '../../../lib/i18nconf';

const ChatPage = () => {
	const [messages, setMessages] = useState([]);
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [threadId, setThreadId] = useState(null);
	const { t, i18n } = useTranslation();

	// Generate thread ID when component mounts
	useEffect(() => {
		setThreadId(uuidv4());
	}, []);

	const handleLanguageChange = (event) => {
		i18n.changeLanguage(event.target.value);
	};

	const handleSendMessage = async () => {
		if (!query.trim() || !threadId) return;

		const newMessage = {
			id: Date.now().toString(),
			text: query,
			sender: 'user',
		};

		setMessages((prev) => [...prev, newMessage]);
		setQuery('');
		setLoading(true);

		try {
			const response = await fetch(
				'https://dfbf-38-188-110-250.ngrok-free.app/chat/v2',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ query, thread_id: threadId }),
				}
			);

			const data = await response.json();

			if (data.message) {
				setMessages((prev) => [
					...prev,
					{
						id: Date.now().toString() + '-bot',
						text: data.message,
						sender: 'bot',
					},
				]);
			} else {
				console.error('Invalid response format:', data);
			}
		} catch (error) {
			console.error('Error fetching response:', error);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString() + '-bot',
					text: 'Error getting response.',
					sender: 'bot',
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Chat Header */}
			<header className='bg-card text-card-foreground p-4 shadow-md text-center text-xl font-semibold flex justify-between items-center'>
				<div>
					<span className='text-muted-foreground text-xs'>
						{threadId && `${t('threadId')} ${threadId}`}
					</span>{' '}
					{/* - <span className='text-primary'>Law Saarthi</span> */}
				</div>
				<Select
					value={i18n.language}
					onChange={handleLanguageChange}
					className='w-40'
				>
					{languages.map((lang) => (
						<option key={lang.code} value={lang.code}>
							{lang.name}
						</option>
					))}
				</Select>
			</header>

			<div className='flex flex-col h-[400px] lg:h-[600px] max-w-5xl mx-auto bg-background text-foreground'>
				{/* Chat Messages */}
				<div className='flex-1 overflow-y-auto p-6 space-y-4  px-10'>
					{messages.length === 0 && (
						<div className='text-center text-muted-foreground'>
							<h2 className='text-2xl font-semibold'>
								<span className='text-primary'>{t('welcome')}</span> 👋
							</h2>
							<p className='text-lg'>{t('description')}</p>
						</div>
					)}

					<div className='flex flex-col space-y-4'>
						{messages.map((msg) => (
							<Card
								key={msg.id}
								className={`max-w-[90%] sm:max-w-xl lg:max-w-3xl px-5 py-3 rounded-2xl break-words ${
									msg.sender === 'user'
										? 'bg-primary text-primary-foreground self-end ml-auto rounded-tr-none'
										: 'bg-card text-card-foreground rounded-tl-none'
								}`}
							>
								<TiptapViewer content={msg.text} />
							</Card>
						))}
					</div>

					{loading && (
						<Card className='max-w-3xl px-5 py-3 rounded-lg bg-muted text-muted-foreground'>
							{t('typing')}
						</Card>
					)}
				</div>

				{/* Chat Input */}
				<div className='p-6 bg-card border-t max-w-5xl mx-auto flex flex-col gap-2'>
					<div className='flex items-center gap-4'>
						<Input
							type='text'
							placeholder={t('placeholder')}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className='flex-1 px-4 py-8 text-lg bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary lg:text-xl'
							onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
						/>
						<Button
							onClick={handleSendMessage}
							disabled={loading}
							className='bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-8 lg:px-8 lg:py-4 rounded-tr-none rounded-full'
						>
							<Send className='size-6' />
						</Button>
					</div>

					{/* Disclaimer */}
					<p className='text-center text-sm text-muted-foreground'>
						{t('disclaimer')}
					</p>
				</div>
			</div>
		</>
	);
};

export default ChatPage;
