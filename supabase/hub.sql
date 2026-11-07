-- =========================================================
-- HUB do arcanospeedruns: banco de dados e fotos no Supabase
-- Cole tudo no SQL Editor do Supabase e clique em "Run".
-- Só a conta com o e-mail abaixo consegue escrever. Qualquer
-- pessoa consegue ler os posts publicados.
-- =========================================================

-- e-mail da única conta que pode postar
create or replace function public.hub_dono()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'arcanospeedruns@gmail.com'
$$;

-- posts
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  titulo      text not null default '',
  texto       text not null default '',
  fotos       jsonb not null default '[]'::jsonb,   -- [{ "caminho": "...", "w": 0, "h": 0 }]
  publicado   boolean not null default false,
  criado_em   timestamptz not null default now(),
  editado_em  timestamptz not null default now()
);

create index if not exists posts_publicado_criado on public.posts (publicado, criado_em desc);

-- atualiza "editado_em" sozinho
create or replace function public.hub_tocar_editado()
returns trigger language plpgsql as $$
begin
  new.editado_em := now();
  return new;
end $$;
drop trigger if exists posts_editado on public.posts;
create trigger posts_editado before update on public.posts
  for each row execute function public.hub_tocar_editado();

-- a API pública enxerga a tabela; o que cada um pode fazer é decidido pelas regras abaixo
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

-- regras de acesso (RLS)
alter table public.posts enable row level security;

drop policy if exists "ler publicados" on public.posts;
create policy "ler publicados" on public.posts
  for select using (publicado or public.hub_dono());

drop policy if exists "dono cria" on public.posts;
create policy "dono cria" on public.posts
  for insert with check (public.hub_dono());

drop policy if exists "dono edita" on public.posts;
create policy "dono edita" on public.posts
  for update using (public.hub_dono()) with check (public.hub_dono());

drop policy if exists "dono apaga" on public.posts;
create policy "dono apaga" on public.posts
  for delete using (public.hub_dono());

-- fotos: pasta pública "fotos" (qualquer um vê, só o dono envia e apaga)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "fotos: dono envia" on storage.objects;
create policy "fotos: dono envia" on storage.objects
  for insert with check (bucket_id = 'fotos' and public.hub_dono());

drop policy if exists "fotos: dono troca" on storage.objects;
create policy "fotos: dono troca" on storage.objects
  for update using (bucket_id = 'fotos' and public.hub_dono());

drop policy if exists "fotos: dono apaga" on storage.objects;
create policy "fotos: dono apaga" on storage.objects
  for delete using (bucket_id = 'fotos' and public.hub_dono());

-- apagar uma foto pela API também exige permissão de leitura do registro
drop policy if exists "fotos: dono lê" on storage.objects;
create policy "fotos: dono lê" on storage.objects
  for select using (bucket_id = 'fotos' and public.hub_dono());
