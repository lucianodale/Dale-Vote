
import { createClient } from '@supabase/supabase-js';
import { VotingItem, Vote } from '../types';

// Novo projeto baseado na chave fornecida: qmjyidfrtytjnkadmzrs
const SUPABASE_URL = 'https://qmjyidfrtytjnkadmzrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtanlpZGZydHl0am5rYWRtenJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTc5OTEsImV4cCI6MjA4MzM3Mzk5MX0.0_ecXBa-uQvod38Uzi1Dpv0Uf5-y62F31c2eFqLXBPY'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

class DatabaseService {
  
  private mapItem(row: any): VotingItem {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      isPublished: row.is_published,
      createdAt: Number(row.created_at)
    };
  }

  private mapVote(row: any): Vote {
    return {
      id: row.id,
      itemId: row.item_id,
      voterName: row.voter_name,
      voterEmail: row.voter_email,
      voterPhone: row.voter_phone,
      isVerified: row.is_verified,
      createdAt: Number(row.created_at)
    };
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return await supabase.auth.signOut();
  }

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  onAuthChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }

  async getItems(): Promise<VotingItem[]> {
    try {
      const { data, error } = await supabase
        .from('voting_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return (data || []).map(this.mapItem);
    } catch (err) {
      return [];
    }
  }

  async saveItem(item: VotingItem): Promise<void> {
    const { error } = await supabase
      .from('voting_items')
      .insert([{
        id: item.id,
        title: item.title,
        description: item.description,
        image_url: item.imageUrl,
        is_published: item.isPublished,
        created_at: item.createdAt
      }]);
    if (error) throw error;
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from('voting_items').delete().eq('id', id);
    if (error) throw error;
  }

  async updateItem(id: string, updates: Partial<VotingItem>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;

    const { error } = await supabase.from('voting_items').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }

  async getVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(this.mapVote);
    } catch (err) {
      return [];
    }
  }

  async saveVote(vote: Vote): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .insert([{
        id: vote.id,
        item_id: vote.itemId,
        voter_name: vote.voterName,
        voter_email: vote.voterEmail,
        voter_phone: vote.voterPhone,
        is_verified: vote.isVerified,
        created_at: vote.createdAt
      }]);
    if (error) throw error;
  }

  async deleteVote(id: string): Promise<void> {
    const { error } = await supabase.from('votes').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteVotesByItem(itemId: string): Promise<void> {
    const { error } = await supabase.from('votes').delete().eq('item_id', itemId);
    if (error) throw error;
  }
}

export const db = new DatabaseService();
