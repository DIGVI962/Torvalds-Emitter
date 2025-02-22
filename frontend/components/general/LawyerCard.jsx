import React from 'react';

function getInitials(name) {
	const nameParts = name.split(' ');
	return nameParts.length >= 2
		? `${nameParts[0][0]}${nameParts[1][0]}`
		: nameParts[0][0];
}

export default function LawyerCard({ lawyer }) {
	return (
		<div className='p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 flex gap-4 items-start'>
			{/* Avatar with initials */}
			<div className='w-12 h-12 flex items-center justify-center bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full text-lg font-semibold'>
				{getInitials(lawyer.lastName || lawyer.firmName)}
			</div>

			{/* Lawyer Details */}
			<div className='flex-1'>
				<h2 className='text-lg font-semibold'>{lawyer.firmName}</h2>
				<h3 className='text-md font-semibold'>{lawyer.fullName} </h3>
				<p className='text-gray-600 dark:text-gray-400 flex items-center'>
					📍 {lawyer.location}
				</p>
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					{lawyer.expertise?.map((item) => (
						<span key={item} className='mr-2 capitalize'>
							{item}
						</span>
					))}
				</p>

				{/* Clickable email */}
				{lawyer.email && (
					<a
						href={`mailto:${lawyer.email}`}
						className='text-blue-500 hover:underline text-sm'
					>
						{lawyer.email}
					</a>
				)}
			</div>
		</div>
	);
}
