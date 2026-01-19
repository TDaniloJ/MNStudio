import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, FileText, ArrowRight, Clock, Eye, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { mangaService } from '../services/mangaService';
import { novelService } from '../services/novelService';
import { getImageUrl, formatNumber, formatDate } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import ContentCard2 from '../components/common/ContentCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // ✅ FUNÇÃO PARA IDENTIFICAR CORRETAMENTE O TIPO DA OBRA
  const getContentType = (item, source) => {
    // Se já tiver type definido, usa ele
    if (item.type) return item.type;
    if (item.contentType) return item.contentType;
    
    // Se veio do mangaService, é manga
    if (source === 'manga') return 'manga';
    // Se veio do novelService, é novel
    if (source === 'novel') return 'novel';
    
    // Fallback: verifica se tem campos específicos
    if (item.chapters && item.chapters[0]?.pages) return 'manga';
    if (item.chapters && item.chapters[0]?.content) return 'novel';
    
    // Último fallback
    return 'manga';
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Buscar destaques (obras com mais views)
      const [featuredMangas, featuredNovels] = await Promise.all([
        mangaService.getAll({ limit: 3, sort: 'views' }),
        novelService.getAll({ limit: 3, sort: 'views' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allFeatured = [
        ...featuredMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...featuredNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].sort((a, b) => b.views - a.views).slice(0, 5);

      setFeatured(allFeatured);

      // Buscar atualizações recentes (misturado)
      const [recentMangas, recentNovels] = await Promise.all([
        mangaService.getAll({ limit: 12, sort: 'created_at' }),
        novelService.getAll({ limit: 12, sort: 'created_at' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allRecent = [
        ...recentMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...recentNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 18);

      setRecentUpdates(allRecent);

      // Buscar recomendações (aleatório com boas avaliações)
      const [recommendedMangas, recommendedNovels] = await Promise.all([
        mangaService.getAll({ limit: 6, sort: 'rating' }),
        novelService.getAll({ limit: 6, sort: 'rating' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allRecommended = [
        ...recommendedMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...recommendedNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].slice(0, 12);

      setRecommended(allRecommended);

      // Anexar capítulos para os cards (para mostrar último capítulo / contagem)
      const attachChapters = async (items) => {
        return await Promise.all(items.map(async (it) => {
          try {
            if (it.contentType === 'manga') {
              const ch = await mangaService.getMangaChapters(it.id);
              it.chapters = ch.chapters || ch.chapters || ch.chapters || [];
            } else {
              const ch = await novelService.getNovelChapters(it.id);
              it.chapters = ch.chapters || ch.chapters || ch.chapters || [];
            }
          } catch (e) {
            it.chapters = it.chapters || [];
          }
          return it;
        }));
      };

      // fetch in parallel but limited set sizes (already limited by API calls)
      setFeatured(await attachChapters(allFeatured));
      setRecentUpdates(await attachChapters(allRecent));
      setRecommended(await attachChapters(allRecommended));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Slider */}
      <div className="relative bg-gray-900 dark:bg-gray-950 mb-8">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
          spaceBetween={30}
          slidesPerView={'auto'}
          centeredSlides={true}
          loop={true}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary-500',
            bulletClass: 'swiper-pagination-bullet !bg-white/50 dark:!bg-gray-600',
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          className="hero-slider"
          style={{ height: '400px', paddingBottom: '40px', marginBottom: '30px' }}
        >
          {featured.map((item) => (
            <SwiperSlide key={`${item.type}-${item.id}`} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
              <FeaturedSlide item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container-custom">

        {/* Atualizações Recentes */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 ">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Atualizados Recentemente
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Últimas obras que receberam novos capítulos
              </p>
            </div>
            <div className="flex gap-3 gap-x-4">
              <Link to="/mangas">
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  Ver Mangás
                </Button>
              </Link>
              <Link to="/novels">
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  Ver Novels
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-4">
            {recentUpdates.map((item) => (
              <ContentCard2 
                key={`${item.type}-${item.id}`} 
                item={item} 
                // ✅ FORÇAR O TIPO CORRETO
                type={item.type}
              />
            ))}
          </div>
        </section>

        {/* Recomendações */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recomendações para Você
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Obras selecionadas que você pode gostar
              </p>
            </div>
            <Link
              to="/mangas"
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Ver todas
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-4">
            {recommended.map((item) => (
              <ContentCard2 
                key={`rec-${item.type}-${item.id}`} 
                item={item} 
                showRating 
                // ✅ FORÇAR O TIPO CORRETO
                type={item.type}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

// Featured Slide Component - ✅ CORRIGIDO
const FeaturedSlide = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(item.cover_image);
  const link = `/${item.type}/${item.id}`;

  return (
    <Link to={link} className="block">
      <div className="flex items-center justify-center">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-64 h-80 sm:w-72 sm:h-80 md:w-80 md:h-80 lg:w-96 lg:h-96 object-cover rounded-lg shadow-lg transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-64 h-80 sm:w-72 sm:h-80 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gray-800 rounded-lg" />
        )}
      </div>
    </Link>
  );
};

export default Home;