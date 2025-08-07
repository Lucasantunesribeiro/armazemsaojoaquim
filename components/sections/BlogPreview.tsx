'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ArrowRight, Book, Camera, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/Button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/Card'
import { useTranslations } from '@/hooks/useTranslations'

const BlogPreview = () => {
	const { t } = useTranslations()
	const [activeImageIndex, setActiveImageIndex] = useState(0)

	const neighborhoodImages = [
		{
			src: '/images/santa-teresa-vista-panoramica.jpg',
			alt: t('home.blogPreview.neighborhood.images.panoramic.alt'),
			title: t('home.blogPreview.neighborhood.images.panoramic.title'),
			description: t('home.blogPreview.neighborhood.images.panoramic.description'),
		},
		{
			src: '/images/bondinho.jpg',
			alt: t('home.blogPreview.neighborhood.images.tram.alt'),
			title: t('home.blogPreview.neighborhood.images.tram.title'),
			description: t('home.blogPreview.neighborhood.images.tram.description'),
		},
	]

	const blogPosts = [
		{
			id: 'eba7ad99-df5c-40e8-a3fb-597e7945c4d6',
			title: 'A História do Armazém São Joaquim',
			excerpt:
				'Conheça a fascinante história de 170 anos do nosso restaurante histórico no coração de Santa Teresa.',
			category: 'História',
			readTime: '8 min',
			date: '2024-01-15',
			author: 'Equipe Armazém',
			image: '/images/blog/historia-armazem.jpg',
			slug: 'historia-do-armazem-sao-joaquim',
			featured: true,
		},
		{
			id: 'c7d5e4fd-3d36-4e48-b8d1-41fd08d2c37d',
			title: 'A Arte da Mixologia no Armazém',
			excerpt:
				'Conheça o cuidado e a paixão por trás de cada drink servido no Armazém São Joaquim.',
			category: 'Drinks',
			readTime: '6 min',
			date: '2025-06-08',
			author: 'Bartender Especialista',
			image: '/images/blog/a_arte_da_mixologia_no_armazem.png',
			slug: 'a-arte-da-mixologia-no-armazem',
			featured: false,
		},
		{
			id: 'e4681889-d24a-4535-accb-54c5c5055f54',
			title: 'Os Segredos da Nossa Feijoada',
			excerpt:
				'Descubra os segredos por trás da nossa famosa feijoada tradicional.',
			category: 'Gastronomia',
			readTime: '5 min',
			date: '2025-06-07',
			author: 'Chef Tradicional',
			image: '/images/blog/segredos_da_nossa_feijoada.png',
			slug: 'os-segredos-da-nossa-feijoada',
			featured: false,
		},
		{
			id: 'd8e22349-f2ef-46da-be27-8c3f18ca3d3b',
			title: 'Eventos e Celebrações no Armazém',
			excerpt:
				'Descubra como transformar seus momentos especiais em memórias inesquecíveis no Armazém.',
			category: 'Eventos',
			readTime: '7 min',
			date: '2025-06-08',
			author: 'Coordenador de Eventos',
			image: '/images/blog/eventos.jpg',
			slug: 'eventos-e-celebracoes-no-armazem',
			featured: false,
		},
	]

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveImageIndex(prev => (prev + 1) % neighborhoodImages.length)
		}, 5000)

		return () => {
			clearInterval(interval)
		}
	}, [neighborhoodImages.length])

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('pt-BR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}

	return (
		<section
			className="py-24 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-amber-950/20"
			id="blog"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-20">
					<div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full px-6 py-2 mb-6">
						<Book className="w-4 h-4 text-amber-600 dark:text-amber-400" />
						<span className="text-amber-800 dark:text-amber-300 text-sm font-semibold tracking-wide">
							{t('home.blogPreview.badge')}
						</span>
					</div>

					<h2 className="font-playfair text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
						{t('home.blogPreview.title')}{' '}
						<span className="text-amber-600 dark:text-amber-400">
							{t('home.blogPreview.titleHighlight')}
						</span>
					</h2>

					<p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
						{t('home.blogPreview.description')}
					</p>
				</div>

				{/* Neighborhood Gallery */}
				<div className="mb-20">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						{/* Images Display */}
						<div className="relative group">
							<div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
								{neighborhoodImages.map((image, index) => (
									<div
										key={image.src}
										className={`absolute inset-0 transition-opacity duration-1000 ${
											index === activeImageIndex ? 'opacity-100' : 'opacity-0'
										}`}
									>
										<Image
											src={image.src}
											alt={image.alt}
											fill
											className="object-cover"
											quality={90}
											priority={true}
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 450px"
										/>

										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
										<div className="absolute bottom-6 left-6 text-white">
											<h4 className="text-xl font-bold mb-2">{image.title}</h4>
											<p className="text-white/90 text-sm">
												{image.description}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* Image Navigation */}
							<div className="flex justify-center space-x-2 sm:space-x-3 mt-6">
								{neighborhoodImages.map((_, index) => (
									<button
										key={index}
										onClick={() => setActiveImageIndex(index)}
										className={`w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 min-w-[12px] min-h-[12px] touch-manipulation ${
											index === activeImageIndex
												? 'bg-amber-600 dark:bg-amber-400 scale-125'
												: 'bg-slate-300 dark:bg-slate-600 hover:bg-amber-400 dark:hover:bg-amber-500 hover:scale-110 active:scale-95'
										}`}
										aria-label={`${t('home.blogPreview.imageNav')} ${index + 1}`}
									/>
								))}
							</div>
						</div>

						{/* Blog Stats & Info */}
						<div className="space-y-8">
							<div className="text-center md:text-left">
								<h3 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
									{t('home.blogPreview.neighborhood.title')}
								</h3>
								<p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
									{t('home.blogPreview.neighborhood.description')}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700">
									<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br from-amber-500 to-orange-500">
										<Book className="w-6 h-6 text-white" />
									</div>
									<div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
										50+
									</div>
									<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
										{t('home.blogPreview.stats.articles')}
									</p>
								</div>

								<div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700">
									<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br from-blue-500 to-cyan-500">
										<Camera className="w-6 h-6 text-white" />
									</div>
									<div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
										200+
									</div>
									<p className="text-sm font-medium text-slate-600 dark:text-slate-400">
										{t('home.blogPreview.stats.photos')}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Featured Post */}
				{blogPosts
					.filter(post => post.featured)
					.map(post => (
						<div key={post.id} className="mb-16">
							<div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-3xl transition-all duration-300">
								<div className="grid md:grid-cols-2 gap-0">
									<div className="relative h-80 md:h-96">
										<Image
											src={post.image}
											alt={post.title}
											fill
											className="object-cover"
											quality={90}
											priority={true}
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
										/>
										<div className="absolute top-4 left-4">
											<span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
												{t('home.blogPreview.posts.featured')}
											</span>
										</div>
									</div>
									<div className="p-8 md:p-12 flex flex-col justify-center">
										<div className="flex items-center space-x-4 mb-4">
											<span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold px-3 py-1 rounded-full">
												{post.category}
											</span>
											<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
												<Clock className="w-4 h-4 mr-1" />
												{post.readTime}
											</div>
										</div>
										<h3 className="font-playfair text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
											{post.title}
										</h3>
										<p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
											{post.excerpt}
										</p>
										<div className="flex items-center justify-between">
											<div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
												<Calendar className="w-4 h-4 mr-2" />
												{formatDate(post.date)} • {post.author}
											</div>
											<Link prefetch={true} href={`/blog/${post.slug}`} passHref>
												<Button
													variant="outline"
													className="group"
													aria-label={`${t('home.blogPreview.posts.readMoreAria')} ${post.title}`}
												>
													{t('home.blogPreview.posts.readMore')}
													<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
												</Button>
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}

				{/* Other Posts */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
					{blogPosts
						.filter(post => !post.featured)
						.map(post => (
							<Card
								key={post.id}
								className="group overflow-hidden transform hover:-translate-y-2 transition-transform duration-300"
							>
								<CardHeader className="p-0">
									<div className="relative h-56">
										<Image
											src={post.image}
											alt={post.title}
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-700"
											priority={true}
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 300px"
										/>
									</div>
								</CardHeader>
								<CardContent className="p-6">
									<div className="flex items-center space-x-4 mb-4">
										<span className="bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
											{post.category}
										</span>
									</div>
									<Link prefetch={true} href={`/blog/${post.slug}`} passHref>
										<CardTitle className="p-6 pb-0 font-playfair text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
											{post.title}
										</CardTitle>
									</Link>
									<p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed">
										{post.excerpt}
									</p>
								</CardContent>
								<CardFooter className="p-6 pt-0 flex items-center justify-between">
									<span className="text-slate-500 dark:text-slate-400 text-sm">
										{post.author}
									</span>
									<Link prefetch={true} href={`/blog/${post.slug}`} passHref>
										<Button
											variant="ghost"
											size="sm"
											className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 group"
										>
											{t('home.blogPreview.posts.read')}
											<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
										</Button>
									</Link>
								</CardFooter>
							</Card>
						))}
				</div>
				<div className="text-center">
					<div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white p-12 rounded-3xl shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer" />
						<MapPin className="w-12 h-12 text-amber-400 mx-auto mb-6" />
						<h3 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
							{t('home.blogPreview.cta.title')}
						</h3>
						<p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
							{t('home.blogPreview.cta.description')}
						</p>
						<Link prefetch={true} href="/blog" passHref>
							<Button size="lg" variant="default">
								<Book className="w-5 h-5 mr-2" />
								{t('home.blogPreview.cta.button')}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}

export default BlogPreview