export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url: string | null
          subscription_tier: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url?: string | null
          subscription_tier?: string
          created_at?: string
        }
        Update: {
          email?: string
          name?: string
          role?: 'player' | 'parent' | 'coach' | 'admin'
          avatar_url?: string | null
          subscription_tier?: string
        }
      }
      player_profiles: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          dominant_foot: 'right' | 'left' | 'both' | null
          primary_position: string | null
          nationality: string | null
          avatar_url: string | null
          phone: string | null
          instagram_handle: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          dominant_foot?: 'right' | 'left' | 'both' | null
          primary_position?: string | null
          nationality?: string | null
          avatar_url?: string | null
          phone?: string | null
          instagram_handle?: string | null
          bio?: string | null
        }
        Update: {
          date_of_birth?: string | null
          dominant_foot?: 'right' | 'left' | 'both' | null
          primary_position?: string | null
          nationality?: string | null
          avatar_url?: string | null
          phone?: string | null
          instagram_handle?: string | null
          bio?: string | null
        }
      }
      seasons: {
        Row: {
          id: string
          player_id: string
          label: string
          start_date: string | null
          end_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          label: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
        }
        Update: {
          label?: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
        }
      }
      clubs: {
        Row: {
          id: string
          player_id: string
          name: string
          logo_url: string | null
          website: string | null
          contact_email: string | null
          contact_phone: string | null
          has_professional_pathway: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          name: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          has_professional_pathway?: boolean
          notes?: string | null
        }
        Update: {
          name?: string
          logo_url?: string | null
          website?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          has_professional_pathway?: boolean
          notes?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          club_id: string
          season_id: string
          player_id: string
          age_group: string
          team_label: string
          kit_primary_colour: string | null
          kit_secondary_colour: string | null
          training_hours_per_week: number | null
          league_level: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          club_id: string
          season_id: string
          player_id: string
          age_group: string
          team_label: string
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          training_hours_per_week?: number | null
          league_level?: string | null
          is_active?: boolean
        }
        Update: {
          age_group?: string
          team_label?: string
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          training_hours_per_week?: number | null
          league_level?: string | null
          is_active?: boolean
        }
      }
      teammates: {
        Row: {
          id: string
          player_id: string
          team_id: string
          season_id: string
          name: string
          nickname: string | null
          positions: string[] | null
          kit_number: number | null
          phone: string | null
          email: string | null
          instagram_handle: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          team_id: string
          season_id: string
          name: string
          nickname?: string | null
          positions?: string[] | null
          kit_number?: number | null
          phone?: string | null
          email?: string | null
          instagram_handle?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          nickname?: string | null
          positions?: string[] | null
          kit_number?: number | null
          phone?: string | null
          email?: string | null
          instagram_handle?: string | null
          notes?: string | null
        }
      }
      competitions: {
        Row: {
          id: string
          team_id: string
          season_id: string
          player_id: string
          name: string
          type: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level: string | null
          default_match_minutes: number | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          season_id: string
          player_id: string
          name: string
          type?: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level?: string | null
          default_match_minutes?: number | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          type?: 'league' | 'cup' | 'friendly' | 'trial' | 'tournament' | null
          league_level?: string | null
          default_match_minutes?: number | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string
          competition_id: string | null
          date: string
          opponent: string
          venue_type: 'home' | 'away' | 'neutral' | null
          stage: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes: number | null
          minutes_played: number | null
          goals_for: number | null
          goals_against: number | null
          result: 'W' | 'D' | 'L' | null
          mood: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id: string
          competition_id?: string | null
          date: string
          opponent: string
          venue_type?: 'home' | 'away' | 'neutral' | null
          stage?: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes?: number | null
          minutes_played?: number | null
          goals_for?: number | null
          goals_against?: number | null
          result?: 'W' | 'D' | 'L' | null
          mood?: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating?: number | null
        }
        Update: {
          date?: string
          opponent?: string
          venue_type?: 'home' | 'away' | 'neutral' | null
          stage?: 'pool' | 'knockout' | 'final' | 'group' | 'friendly' | 'other' | null
          total_match_minutes?: number | null
          minutes_played?: number | null
          goals_for?: number | null
          goals_against?: number | null
          result?: 'W' | 'D' | 'L' | null
          mood?: 'brilliant' | 'good' | 'ok' | 'tough' | 'frustrated' | null
          overall_rating?: number | null
        }
      }
      match_positions: {
        Row: {
          id: string
          match_id: string
          position: string
          minutes_from: number | null
          minutes_to: number | null
        }
        Insert: {
          id?: string
          match_id: string
          position: string
          minutes_from?: number | null
          minutes_to?: number | null
        }
        Update: {
          position?: string
          minutes_from?: number | null
          minutes_to?: number | null
        }
      }
      match_ratings: {
        Row: {
          id: string
          match_id: string
          dimension: string
          score: number | null
        }
        Insert: {
          id?: string
          match_id: string
          dimension: string
          score?: number | null
        }
        Update: {
          dimension?: string
          score?: number | null
        }
      }
      match_video_moments: {
        Row: {
          id: string
          match_id: string
          url: string
          timestamp_in_video: string | null
          label: string | null
          notes: string | null
          moment_type: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          url: string
          timestamp_in_video?: string | null
          label?: string | null
          notes?: string | null
          moment_type?: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
        }
        Update: {
          url?: string
          timestamp_in_video?: string | null
          label?: string | null
          notes?: string | null
          moment_type?: 'highlight' | 'learning' | 'error' | 'goal' | 'assist' | null
        }
      }
      training_sessions: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string | null
          date: string
          duration_minutes: number | null
          session_type: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas: string[] | null
          coach_led: boolean
          notes: string | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id?: string | null
          date: string
          duration_minutes?: number | null
          session_type?: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas?: string[] | null
          coach_led?: boolean
          notes?: string | null
          rating?: number | null
        }
        Update: {
          date?: string
          duration_minutes?: number | null
          session_type?: 'technical' | 'tactical' | 'physical' | 'set_pieces' | 'small_sided' | 'fitness' | 'other' | null
          focus_areas?: string[] | null
          coach_led?: boolean
          notes?: string | null
          rating?: number | null
        }
      }
      reflections: {
        Row: {
          id: string
          player_id: string
          entity_type: 'match' | 'training' | 'standalone' | null
          entity_id: string | null
          author_role: 'player' | 'parent' | 'coach' | null
          went_well: string | null
          improve_next: string | null
          key_moment: string | null
          coach_feedback_received: string | null
          free_text: string | null
          visibility: 'player_only' | 'family' | 'coach' | 'public'
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          entity_type?: 'match' | 'training' | 'standalone' | null
          entity_id?: string | null
          author_role?: 'player' | 'parent' | 'coach' | null
          went_well?: string | null
          improve_next?: string | null
          key_moment?: string | null
          coach_feedback_received?: string | null
          free_text?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public'
          ai_feedback?: string | null
        }
        Update: {
          went_well?: string | null
          improve_next?: string | null
          key_moment?: string | null
          coach_feedback_received?: string | null
          free_text?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public'
          ai_feedback?: string | null
        }
      }
      diagnostics: {
        Row: {
          id: string
          player_id: string
          season_id: string
          date: string
          scores: Json
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          date: string
          scores: Json
          ai_summary?: string | null
        }
        Update: {
          date?: string
          scores?: Json
          ai_summary?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_id: string | null
          text: string
          why: string | null
          pillar: string | null
          set_by: 'player' | 'parent' | 'coach' | null
          target_date: string | null
          completed_at: string | null
          completion_reflection: string | null
          visibility: 'player_only' | 'family' | 'coach' | 'public'
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_id?: string | null
          text: string
          why?: string | null
          pillar?: string | null
          set_by?: 'player' | 'parent' | 'coach' | null
          target_date?: string | null
          completed_at?: string | null
          completion_reflection?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public'
        }
        Update: {
          text?: string
          why?: string | null
          pillar?: string | null
          set_by?: 'player' | 'parent' | 'coach' | null
          target_date?: string | null
          completed_at?: string | null
          completion_reflection?: string | null
          visibility?: 'player_only' | 'family' | 'coach' | 'public'
        }
      }
      season_reviews: {
        Row: {
          id: string
          player_id: string
          season_id: string
          team_reflections: Json | null
          proud: string | null
          hardest_moment: string | null
          new_skill: string | null
          gap: string | null
          coach_theme: string | null
          letter_to_self: string | null
          ratings: Json | null
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          team_reflections?: Json | null
          proud?: string | null
          hardest_moment?: string | null
          new_skill?: string | null
          gap?: string | null
          coach_theme?: string | null
          letter_to_self?: string | null
          ratings?: Json | null
          ai_feedback?: string | null
        }
        Update: {
          team_reflections?: Json | null
          proud?: string | null
          hardest_moment?: string | null
          new_skill?: string | null
          gap?: string | null
          coach_theme?: string | null
          letter_to_self?: string | null
          ratings?: Json | null
          ai_feedback?: string | null
        }
      }
      summer_plans: {
        Row: {
          id: string
          player_id: string
          season_id: string
          technical_skills: Json | null
          physical_skills: Json | null
          watch_skills: Json | null
          min_sessions_per_week: number | null
          session_length_minutes: number | null
          big_goal: string | null
          accountability_partner: string | null
          september_self_image: string | null
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          season_id: string
          technical_skills?: Json | null
          physical_skills?: Json | null
          watch_skills?: Json | null
          min_sessions_per_week?: number | null
          session_length_minutes?: number | null
          big_goal?: string | null
          accountability_partner?: string | null
          september_self_image?: string | null
          ai_feedback?: string | null
        }
        Update: {
          technical_skills?: Json | null
          physical_skills?: Json | null
          watch_skills?: Json | null
          min_sessions_per_week?: number | null
          session_length_minutes?: number | null
          big_goal?: string | null
          accountability_partner?: string | null
          september_self_image?: string | null
          ai_feedback?: string | null
        }
      }
      parent_observations: {
        Row: {
          id: string
          player_id: string
          parent_user_id: string
          entity_type: 'match' | 'training' | null
          entity_id: string | null
          observation: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          parent_user_id: string
          entity_type?: 'match' | 'training' | null
          entity_id?: string | null
          observation: string
        }
        Update: {
          observation?: string
        }
      }
      coach_access: {
        Row: {
          id: string
          player_id: string
          coach_user_id: string
          access_level: 'limited' | 'full' | null
          invited_at: string
          accepted_at: string | null
          revoked_at: string | null
        }
        Insert: {
          id?: string
          player_id: string
          coach_user_id: string
          access_level?: 'limited' | 'full' | null
          invited_at?: string
          accepted_at?: string | null
          revoked_at?: string | null
        }
        Update: {
          access_level?: 'limited' | 'full' | null
          accepted_at?: string | null
          revoked_at?: string | null
        }
      }
      parent_links: {
        Row: {
          id: string
          player_id: string
          parent_user_id: string
          linked_at: string
        }
        Insert: {
          id?: string
          player_id: string
          parent_user_id: string
          linked_at?: string
        }
        Update: Record<string, never>
      }
    }
  }
}
