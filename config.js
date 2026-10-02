// LD Creation - Supabase configuration
// This file uses the public Supabase anon key. Never put a service_role key here.
const SUPABASE_URL = "https://pxfhryccsnvzfuigeumc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZmhyeWNjc252emZ1aWdldW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODY4MjEsImV4cCI6MjEwNjE2MjgyMX0.dFf_OgJZ_wa_0gOQQdNIg1wjg5IU2igu60lcYfcQmu8";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
