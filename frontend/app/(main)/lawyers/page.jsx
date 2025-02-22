import LawyerCard from '@/components/general/LawyerCard';
import Link from 'next/link';

export default async function LawyersPage({ searchParams }) {
	const params = await searchParams;
	const page = parseInt(params?.page) || 1; // Default to page 1
	const limit = 12; // Number of lawyers per page

	try {
		// ✅ Fetch all lawyers (but show only a few at a time)
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/lawyers/`,
			{ cache: 'no-store' }
		);
		if (!response.ok) throw new Error('Failed to fetch lawyers');

		const { data: lawyers } = await response.json();

		const total = lawyers.length; // Total number of lawyers
		const totalPages = Math.ceil(total / limit); // Total pages
		const start = (page - 1) * limit;
		const paginatedLawyers = lawyers.slice(start, start + limit); // Show only selected range

		return (
			<div className='container mx-auto p-6'>
				<h1 className='text-2xl font-bold mb-4'>All Lawyers</h1>

				{paginatedLawyers.length > 0 ? (
					<ul className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{paginatedLawyers.map((lawyer, index) => (
							<LawyerCard key={index} lawyer={lawyer} />
						))}
					</ul>
				) : (
					<p className='text-gray-500'>No lawyers found.</p>
				)}

				{/* Pagination Controls */}
				<div className='flex justify-between items-center mt-6'>
					{page > 1 ? (
						<Link
							href={`/lawyers?page=${page - 1}`}
							className='px-4 py-2 border rounded-md bg-gray-200 hover:bg-gray-300'
						>
							← Previous
						</Link>
					) : (
						<span className='opacity-50 px-4 py-2'>← Previous</span>
					)}

					<p>
						Page {page} of {totalPages}
					</p>

					{page < totalPages ? (
						<Link
							href={`/lawyers?page=${page + 1}`}
							className='px-4 py-2 border rounded-md bg-muted hover:bg-muted'
						>
							Next →
						</Link>
					) : (
						<span className='opacity-50 px-4 py-2'>Next →</span>
					)}
				</div>
			</div>
		);
	} catch (error) {
		return (
			<p className='text-center p-6 text-red-500'>Error: {error.message}</p>
		);
	}
}
