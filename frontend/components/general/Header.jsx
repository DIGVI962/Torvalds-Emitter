import Link from 'next/link';
import React from 'react';
import { buttonVariants } from '../ui/button';
import Image from 'next/image';

const Header = () => {
	return (
		<div className='w-full flex justify-between items-center px-10 py-2'>
			<Image
				alt='logo'
				src={'/logo.png'}
				height={24}
				width={24}
				className='size-10'
			/>
			<div className='flex gap-4'>
				<Link className={buttonVariants({ variant: 'ghost' })} href='/'>
					{' '}
					Home{' '}
				</Link>
				<Link className={buttonVariants({ variant: 'ghost' })} href='/'>
					{' '}
					About{' '}
				</Link>
				<Link className={buttonVariants({ variant: 'ghost' })} href='/'>
					{' '}
					Chat{' '}
				</Link>
				<Link className={buttonVariants({ variant: 'ghost' })} href='/'>
					{' '}
					Lawyers{' '}
				</Link>
			</div>
		</div>
	);
};

export default Header;
