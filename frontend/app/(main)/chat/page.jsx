'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TiptapViewer from '@/components/TiptapViewer';

const ChatPage = () => {
	const [messages, setMessages] = useState([]);
	const [query, setQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const [threadId, setThreadId] = useState(null);

	// Generate thread ID when component mounts
	useEffect(() => {
		setThreadId(uuidv4());
	}, []);

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
		<div className='flex flex-col h-screen bg-background text-foreground'>
			{/* Chat Header */}
			<header className='bg-card text-card-foreground p-4 shadow-md text-center text-xl font-semibold'>
				<span className='text-muted-foreground text-xs'>
					{threadId && `Thread ID: ${threadId}`}
				</span>{' '}
				- <span className='text-primary'>Law Saarthi</span>
			</header>

			{/* Chat Messages */}
			<div className='flex-1 overflow-y-auto p-6 space-y-4'>
				{/* Show an opening message if chat is empty */}
				{messages.length === 0 && (
					<div className='text-center text-muted-foreground'>
						<h2 className='text-2xl font-semibold'>
							Hi, I am <span className='text-primary'>Law Saarthi</span> 👋
						</h2>
						<p className='text-lg'>
							Your trusted companion on your legal journey. Ask me anything
							about Indian laws!
						</p>
					</div>
				)}

				<div className='flex flex-col space-y-4'>
					{messages.map((msg) => (
						<Card
							key={msg.id}
							className={`max-w-[90%] sm:max-w-xl lg:max-w-3xl px-5 py-3 rounded-lg break-words ${
								msg.sender === 'user'
									? 'bg-primary text-primary-foreground self-end ml-auto'
									: 'bg-card text-card-foreground'
							}`}
						>
							<TiptapViewer content={msg.text} />
						</Card>
					))}
				</div>

				{loading && (
					<Card className='max-w-3xl px-5 py-3 rounded-lg bg-muted text-muted-foreground'>
						Typing...
					</Card>
				)}
			</div>

			{/* Chat Input */}
			<div className='p-6 bg-card border-t flex flex-col gap-2'>
				<div className='flex items-center gap-4'>
					<Input
						type='text'
						placeholder='Ask a legal question...'
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className='flex-1 px-4 py-8 text-lg bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary lg:text-xl'
						onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
					/>
					<Button
						onClick={handleSendMessage}
						disabled={loading}
						className='bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-8 lg:px-8 lg:py-4'
					>
						<Send className='size-6' />
					</Button>
				</div>

				{/* Disclaimer */}
				<p className='text-center text-sm text-muted-foreground'>
					⚠️ The information provided here is for educational purposes only and
					should not be considered legal advice. Please consult a qualified
					lawyer for specific legal concerns.
				</p>
			</div>
		</div>
	);
};

export default ChatPage;
