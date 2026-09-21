export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clubs: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          has_professional_pathway: boolean | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          player_id: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          has_professional_pathway?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          player_id: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          has_professional_pathway?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          player_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_access: {
        Row: {
          accepted_at: string | null
          access_level: string | null
          coach_user_id: string
          id: string
          invited_at: string | null
          player_id: string
          revoked_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string | null
          coach_user_id: string
          id?: string
          invited_at?: string | null
          player_id: string
          revoked_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          access_level?: string | null
          coach_user_id?: string
          id?: string
          invited_at?: string | null
          player_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_access_coach_user_id_fkey"
            columns: ["coach_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_access_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string | null
          default_match_minutes: number | null
          end_date: string | null
          id: string
          league_level: string | null
          name: string
          notes: string | null
          player_id: string
          season_id: string
          start_date: string | null
          team_id: string
          type: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          default_match_minutes?: number | null
          end_date?: string | null
          id?: string
          league_level?: string | null
          name: string
          notes?: string | null
          player_id: string
          season_id: string
          start_date?: string | null
          team_id: string
          type?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          default_match_minutes?: number | null
          end_date?: string | null
          id?: string
          league_level?: string | null
          name?: string
          notes?: string | null
          player_id?: string
          season_id?: string
          start_date?: string | null
          team_id?: string
          type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          date: string
          id: string
          player_id: string
          scores: Json
          season_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          date: string
          id?: string
          player_id: string
          scores: Json
          season_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          date?: string
          id?: string
          player_id?: string
          scores?: Json
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostics_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          completed_at: string | null
          completion_reflection: string | null
          created_at: string | null
          id: string
          pillar: string | null
          player_id: string
          season_id: string
          set_by: string | null
          target_date: string | null
          team_id: string | null
          text: string
          visibility: string | null
          why: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_reflection?: string | null
          created_at?: string | null
          id?: string
          pillar?: string | null
          player_id: string
          season_id: string
          set_by?: string | null
          target_date?: string | null
          team_id?: string | null
          text: string
          visibility?: string | null
          why?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_reflection?: string | null
          created_at?: string | null
          id?: string
          pillar?: string | null
          player_id?: string
          season_id?: string
          set_by?: string | null
          target_date?: string | null
          team_id?: string | null
          text?: string
          visibility?: string | null
          why?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_contributions: {
        Row: {
          ball_x: number | null
          ball_y: number | null
          ball_zone: string | null
          body_part: string | null
          created_at: string | null
          goal_index: number
          goal_type: string | null
          id: string
          keeper_posture: string | null
          keeper_x_pct: number | null
          match_id: string
          period: string | null
          player_id: string
          score_opp: number | null
          score_us: number | null
          shot_x: number | null
          shot_y: number | null
          shot_zone: string | null
          technique: string | null
          video_url: string | null
        }
        Insert: {
          ball_x?: number | null
          ball_y?: number | null
          ball_zone?: string | null
          body_part?: string | null
          created_at?: string | null
          goal_index?: number
          goal_type?: string | null
          id?: string
          keeper_posture?: string | null
          keeper_x_pct?: number | null
          match_id: string
          period?: string | null
          player_id: string
          score_opp?: number | null
          score_us?: number | null
          shot_x?: number | null
          shot_y?: number | null
          shot_zone?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Update: {
          ball_x?: number | null
          ball_y?: number | null
          ball_zone?: string | null
          body_part?: string | null
          created_at?: string | null
          goal_index?: number
          goal_type?: string | null
          id?: string
          keeper_posture?: string | null
          keeper_x_pct?: number | null
          match_id?: string
          period?: string | null
          player_id?: string
          score_opp?: number | null
          score_us?: number | null
          shot_x?: number | null
          shot_y?: number | null
          shot_zone?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_contributions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_contributions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      match_positions: {
        Row: {
          id: string
          match_id: string
          minutes_from: number | null
          minutes_to: number | null
          position: string
        }
        Insert: {
          id?: string
          match_id: string
          minutes_from?: number | null
          minutes_to?: number | null
          position: string
        }
        Update: {
          id?: string
          match_id?: string
          minutes_from?: number | null
          minutes_to?: number | null
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_positions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_ratings: {
        Row: {
          dimension: string
          id: string
          match_id: string
          score: number | null
        }
        Insert: {
          dimension: string
          id?: string
          match_id: string
          score?: number | null
        }
        Update: {
          dimension?: string
          id?: string
          match_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_video_moments: {
        Row: {
          created_at: string | null
          id: string
          label: string | null
          match_id: string
          moment_type: string | null
          notes: string | null
          timestamp_in_video: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label?: string | null
          match_id: string
          moment_type?: string | null
          notes?: string | null
          timestamp_in_video?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string | null
          match_id?: string
          moment_type?: string | null
          notes?: string | null
          timestamp_in_video?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_video_moments_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          competition_id: string | null
          created_at: string | null
          date: string
          goals_against: number | null
          goals_for: number | null
          id: string
          minutes_played: number | null
          mood: string | null
          opponent: string
          overall_rating: number | null
          player_id: string
          result: string | null
          season_id: string
          stage: string | null
          team_id: string
          total_match_minutes: number | null
          venue_type: string | null
        }
        Insert: {
          competition_id?: string | null
          created_at?: string | null
          date: string
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          minutes_played?: number | null
          mood?: string | null
          opponent: string
          overall_rating?: number | null
          player_id: string
          result?: string | null
          season_id: string
          stage?: string | null
          team_id: string
          total_match_minutes?: number | null
          venue_type?: string | null
        }
        Update: {
          competition_id?: string | null
          created_at?: string | null
          date?: string
          goals_against?: number | null
          goals_for?: number | null
          id?: string
          minutes_played?: number | null
          mood?: string | null
          opponent?: string
          overall_rating?: number | null
          player_id?: string
          result?: string | null
          season_id?: string
          stage?: string | null
          team_id?: string
          total_match_minutes?: number | null
          venue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_links: {
        Row: {
          id: string
          linked_at: string | null
          parent_user_id: string
          player_id: string
        }
        Insert: {
          id?: string
          linked_at?: string | null
          parent_user_id: string
          player_id: string
        }
        Update: {
          id?: string
          linked_at?: string | null
          parent_user_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_links_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_links_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_observations: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          observation: string
          parent_user_id: string
          player_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          observation: string
          parent_user_id: string
          player_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          observation?: string
          parent_user_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_observations_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_observations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      player_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          date_taken: string | null
          id: string
          player_id: string
          season_id: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          date_taken?: string | null
          id?: string
          player_id: string
          season_id?: string | null
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          date_taken?: string | null
          id?: string
          player_id?: string
          season_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_photos_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_photos_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          ai_coach_enabled: boolean
          avatar_url: string | null
          bio: string | null
          consent_given_at: string | null
          created_at: string | null
          date_of_birth: string | null
          dominant_foot: string | null
          guardian_email: string | null
          guardian_name: string | null
          id: string
          instagram_handle: string | null
          is_minor: boolean | null
          nationality: string | null
          phone: string | null
          primary_position: string | null
          user_id: string
        }
        Insert: {
          ai_coach_enabled?: boolean
          avatar_url?: string | null
          bio?: string | null
          consent_given_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_foot?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_minor?: boolean | null
          nationality?: string | null
          phone?: string | null
          primary_position?: string | null
          user_id: string
        }
        Update: {
          ai_coach_enabled?: boolean
          avatar_url?: string | null
          bio?: string | null
          consent_given_at?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dominant_foot?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_minor?: boolean | null
          nationality?: string | null
          phone?: string | null
          primary_position?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reflection_mentions: {
        Row: {
          created_at: string | null
          id: string
          reflection_id: string
          teammate_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reflection_id: string
          teammate_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reflection_id?: string
          teammate_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflection_mentions_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_mentions_teammate_id_fkey"
            columns: ["teammate_id"]
            isOneToOne: false
            referencedRelation: "teammates"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          ai_feedback: string | null
          author_role: string | null
          coach_feedback_received: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          free_text: string | null
          id: string
          improve_next: string | null
          key_moment: string | null
          player_id: string
          visibility: string | null
          went_well: string | null
        }
        Insert: {
          ai_feedback?: string | null
          author_role?: string | null
          coach_feedback_received?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          free_text?: string | null
          id?: string
          improve_next?: string | null
          key_moment?: string | null
          player_id: string
          visibility?: string | null
          went_well?: string | null
        }
        Update: {
          ai_feedback?: string | null
          author_role?: string | null
          coach_feedback_received?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          free_text?: string | null
          id?: string
          improve_next?: string | null
          key_moment?: string | null
          player_id?: string
          visibility?: string | null
          went_well?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      season_reviews: {
        Row: {
          ai_feedback: string | null
          coach_theme: string | null
          created_at: string | null
          gap: string | null
          hardest_moment: string | null
          id: string
          letter_to_self: string | null
          new_skill: string | null
          player_id: string
          proud: string | null
          ratings: Json | null
          season_id: string
          team_reflections: Json | null
        }
        Insert: {
          ai_feedback?: string | null
          coach_theme?: string | null
          created_at?: string | null
          gap?: string | null
          hardest_moment?: string | null
          id?: string
          letter_to_self?: string | null
          new_skill?: string | null
          player_id: string
          proud?: string | null
          ratings?: Json | null
          season_id: string
          team_reflections?: Json | null
        }
        Update: {
          ai_feedback?: string | null
          coach_theme?: string | null
          created_at?: string | null
          gap?: string | null
          hardest_moment?: string | null
          id?: string
          letter_to_self?: string | null
          new_skill?: string | null
          player_id?: string
          proud?: string | null
          ratings?: Json | null
          season_id?: string
          team_reflections?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "season_reviews_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "season_reviews_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          label: string
          notes: string | null
          player_id: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          notes?: string | null
          player_id: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          notes?: string | null
          player_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      summer_plans: {
        Row: {
          accountability_partner: string | null
          ai_feedback: string | null
          big_goal: string | null
          created_at: string | null
          id: string
          min_sessions_per_week: number | null
          physical_skills: Json | null
          player_id: string
          season_id: string
          september_self_image: string | null
          session_length_minutes: number | null
          technical_skills: Json | null
          watch_skills: Json | null
        }
        Insert: {
          accountability_partner?: string | null
          ai_feedback?: string | null
          big_goal?: string | null
          created_at?: string | null
          id?: string
          min_sessions_per_week?: number | null
          physical_skills?: Json | null
          player_id: string
          season_id: string
          september_self_image?: string | null
          session_length_minutes?: number | null
          technical_skills?: Json | null
          watch_skills?: Json | null
        }
        Update: {
          accountability_partner?: string | null
          ai_feedback?: string | null
          big_goal?: string | null
          created_at?: string | null
          id?: string
          min_sessions_per_week?: number | null
          physical_skills?: Json | null
          player_id?: string
          season_id?: string
          september_self_image?: string | null
          session_length_minutes?: number | null
          technical_skills?: Json | null
          watch_skills?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "summer_plans_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summer_plans_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      teammates: {
        Row: {
          created_at: string | null
          id: string
          kit_number: number | null
          name: string
          nickname: string | null
          notes: string | null
          player_id: string
          positions: string[] | null
          season_id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kit_number?: number | null
          name: string
          nickname?: string | null
          notes?: string | null
          player_id: string
          positions?: string[] | null
          season_id: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kit_number?: number | null
          name?: string
          nickname?: string | null
          notes?: string | null
          player_id?: string
          positions?: string[] | null
          season_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teammates_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammates_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          club_id: string
          created_at: string | null
          format: string | null
          id: string
          is_active: boolean | null
          kit_primary_colour: string | null
          kit_secondary_colour: string | null
          league_level: string | null
          player_id: string
          season_id: string
          team_label: string
          training_hours_per_week: number | null
        }
        Insert: {
          age_group: string
          club_id: string
          created_at?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          league_level?: string | null
          player_id: string
          season_id: string
          team_label: string
          training_hours_per_week?: number | null
        }
        Update: {
          age_group?: string
          club_id?: string
          created_at?: string | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          kit_primary_colour?: string | null
          kit_secondary_colour?: string | null
          league_level?: string | null
          player_id?: string
          season_id?: string
          team_label?: string
          training_hours_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          coach_led: boolean | null
          created_at: string | null
          date: string
          duration_minutes: number | null
          focus_areas: string[] | null
          id: string
          notes: string | null
          player_id: string
          rating: number | null
          season_id: string
          session_type: string | null
          team_id: string | null
        }
        Insert: {
          coach_led?: boolean | null
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          notes?: string | null
          player_id: string
          rating?: number | null
          season_id: string
          session_type?: string | null
          team_id?: string | null
        }
        Update: {
          coach_led?: boolean | null
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          focus_areas?: string[] | null
          id?: string
          notes?: string | null
          player_id?: string
          rating?: number | null
          season_id?: string
          session_type?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          subscription_tier: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          role: string
          subscription_tier?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          subscription_tier?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_own_account: { Args: never; Returns: undefined }
      is_coach_of: { Args: { player: string }; Returns: boolean }
      is_full_coach_of: { Args: { player: string }; Returns: boolean }
      is_parent_of: { Args: { player: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
