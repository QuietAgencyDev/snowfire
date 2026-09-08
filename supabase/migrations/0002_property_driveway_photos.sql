-- Driveway photo types for the customer property record.
-- Storage delete/update so customers can replace their own uploads.

alter type public.photo_type add value if not exists 'DRIVEWAY';
alter type public.photo_type add value if not exists 'DRIVEWAY_FINISHED';

create policy job_media_update on storage.objects
  for update using (
    bucket_id = 'job-media'
    and auth.uid() is not null
  )
  with check (
    bucket_id = 'job-media'
    and auth.uid() is not null
  );

create policy job_media_delete on storage.objects
  for delete using (
    bucket_id = 'job-media'
    and auth.uid() is not null
  );
