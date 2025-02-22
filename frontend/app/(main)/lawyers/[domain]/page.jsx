import LawyerCard from '@/components/general/LawyerCard';

export default async function LawyersByDomainPage({ params }) {
	try {
		const { domain } = await params; // ✅ Get the domain from dynamic route
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/lawyers/expertise/${domain}`,
			{ cache: 'no-store' }
		);
		if (!response.ok) throw new Error('Failed to fetch lawyers');

		const { data: lawyers } = await response.json();

		return (
			<div className='container mx-auto p-6'>
				<h1 className='text-2xl font-bold mb-4 capitalize'>
					Lawyers Specializing in {decodeURIComponent(domain.replace('-', ' '))}
				</h1>
				<div>
					{lawyers.length > 0 ? (
						<ul className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
							{lawyers.map((lawyer, index) => (
								<LawyerCard key={index} lawyer={lawyer} />
							))}
						</ul>
					) : (
						<p className='text-gray-500'>
							No lawyers found for this specialization.
						</p>
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
