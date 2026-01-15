-- Criar banco de dados
CREATE DATABASE mnstudio
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar ao banco
\c mnstudio

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para buscas mais eficientes

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'reader' CHECK (role IN ('admin', 'uploader', 'reader')),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de gêneros
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Criar tabela de mangás
CREATE TABLE IF NOT EXISTS mangas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    alternative_titles TEXT[],
    description TEXT,
    cover_image VARCHAR(255),
    author VARCHAR(100),
    artist VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
    type VARCHAR(20) DEFAULT 'manga' CHECK (type IN ('manga', 'manhwa', 'manhua')),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de novels
CREATE TABLE IF NOT EXISTS novels (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    alternative_titles TEXT[],
    description TEXT,
    cover_image VARCHAR(255),
    author VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de capítulos de mangá
CREATE TABLE IF NOT EXISTS manga_chapters (
    id SERIAL PRIMARY KEY,
    manga_id INTEGER REFERENCES mangas(id) ON DELETE CASCADE,
    chapter_number DECIMAL(5,1) NOT NULL,
    title VARCHAR(255),
    views INTEGER DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manga_id, chapter_number)
);

-- Criar tabela de páginas de mangá
CREATE TABLE IF NOT EXISTS manga_pages (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES manga_chapters(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    UNIQUE(chapter_id, page_number)
);

-- Criar tabela de capítulos de novel
CREATE TABLE IF NOT EXISTS novel_chapters (
    id SERIAL PRIMARY KEY,
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    chapter_number DECIMAL(5,1) NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(novel_id, chapter_number)
);

-- Criar tabela de relacionamento mangá-gênero
CREATE TABLE IF NOT EXISTS manga_genres (
    manga_id INTEGER REFERENCES mangas(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (manga_id, genre_id)
);

-- Criar tabela de relacionamento novel-gênero
CREATE TABLE IF NOT EXISTS novel_genres (
    novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (novel_id, genre_id)
);

-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(10) CHECK (content_type IN ('manga', 'novel')),
    content_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, content_type, content_id)
);

-- Criar tabela de histórico de leitura
CREATE TABLE IF NOT EXISTS reading_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(10) CHECK (content_type IN ('manga', 'novel')),
    content_id INTEGER NOT NULL,
    chapter_id INTEGER NOT NULL,
    last_page INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(10) CHECK (content_type IN ('manga', 'novel')),
    content_id INTEGER NOT NULL,
    chapter_id INTEGER,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mangas_title ON mangas USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_novels_title ON novels USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS idx_manga_chapters_manga_id ON manga_chapters(manga_id);
CREATE INDEX IF NOT EXISTS idx_novel_chapters_novel_id ON novel_chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);

-- Inserir gêneros padrão
INSERT INTO genres (name) VALUES 
('Ação'), ('Aventura'), ('Comédia'), ('Drama'), ('Fantasia'),
('Romance'), ('Horror'), ('Mistério'), ('Sci-Fi'), ('Slice of Life'),
('Esportes'), ('Sobrenatural'), ('Psicológico'), ('Seinen'), ('Shounen'),
('Shoujo'), ('Josei'), ('Ecchi'), ('Harem'), ('Isekai'),
('Mecha'), ('Militar'), ('Musical'), ('Policial'), ('Histórico')
ON CONFLICT (name) DO NOTHING;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mangas_updated_at BEFORE UPDATE ON mangas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_novels_updated_at BEFORE UPDATE ON novels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manga_chapters_updated_at BEFORE UPDATE ON manga_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_novel_chapters_updated_at BEFORE UPDATE ON novel_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_history_updated_at BEFORE UPDATE ON reading_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mensagem de sucesso
SELECT 'Banco de dados configurado com sucesso!' as status;