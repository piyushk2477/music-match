const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const pool = require('./db');
const axios = require('axios');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with ID:', id);
    const [users] = await pool.query('SELECT id, name, email, spotify_id FROM users WHERE id IN (SELECT id FROM users WHERE id = ?)', [id]);
    
    if (!users || users.length === 0) {
      console.log('No user found with ID:', id);
      return done(null, false);
    }
    
    console.log('User deserialized:', users[0].id);
    done(null, users[0]);
  } catch (error) {
    console.error('Error deserializing user:', error.message);
    done(null, false);
  }
});

// Configure Spotify Strategy
passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.SPOTIFY_CALLBACK_URL
    },
    async (accessToken, refreshToken, expires_in, profile, done) => {
      try {
        console.log('Spotify profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value
        });
        
        // Check if user exists using subquery
        const [existingUsers] = await pool.query(
          'SELECT * FROM users WHERE spotify_id IN (SELECT spotify_id FROM users WHERE spotify_id = ?)',
          [profile.id]
        );

        let user;
        let isNewUser = false;
        if (existingUsers.length > 0) {
          // Update existing user
          console.log('Updating existing user:', existingUsers[0].id);
          user = existingUsers[0];
          await pool.query(
            'UPDATE users SET spotify_access_token = ?, spotify_refresh_token = ?, name = ?, email = ? WHERE id IN (SELECT id FROM (SELECT id FROM users WHERE id = ?) AS tmp)',
            [accessToken, refreshToken, profile.displayName, profile.emails?.[0]?.value || `${profile.id}@spotify.com`, user.id]
          );
          user.spotify_access_token = accessToken;
          user.spotify_refresh_token = refreshToken;
        } else {
          // Create new user
          console.log('Creating new user for Spotify ID:', profile.id);
          isNewUser = true;
          const [result] = await pool.query(
            'INSERT INTO users (name, email, spotify_id, spotify_access_token, spotify_refresh_token) VALUES (?, ?, ?, ?, ?)',
            [
              profile.displayName,
              profile.emails?.[0]?.value || `${profile.id}@spotify.com`,
              profile.id,
              accessToken,
              refreshToken
            ]
          );
          
          const [newUser] = await pool.query('SELECT * FROM users WHERE id IN (SELECT id FROM users WHERE id = ?)', [result.insertId]);
          user = newUser[0];
          console.log('New user created with ID:', user.id);
        }

        // Add isNewUser flag to user object
        user.isNewUser = isNewUser;

        // Fetch and store user's top artists and tracks
        console.log('Fetching Spotify data for user:', user.id);
        await fetchAndStoreSpotifyData(user.id, accessToken);

        console.log('Spotify authentication completed successfully');
        return done(null, user);
      } catch (error) {
        console.error('Error in Spotify strategy:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        return done(error, null);
      }
    }
  )
);

// Fetch user's top artists and tracks from Spotify
async function fetchAndStoreSpotifyData(userId, accessToken) {
  try {
    console.log('Fetching top artists from Spotify...');
    // Fetch top artists
    const artistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 5, time_range: 'medium_term' }
    });

    console.log(`Found ${artistsResponse.data.items.length} top artists`);

    // Store artists and link to user
    for (const artist of artistsResponse.data.items) {
      // Check if artist exists using subquery
      const [existingArtists] = await pool.query(
        'SELECT id FROM artists WHERE spotify_id IN (SELECT spotify_id FROM artists WHERE spotify_id = ?)',
        [artist.id]
      );

      let artistId;
      if (existingArtists.length > 0) {
        artistId = existingArtists[0].id;
      } else {
        // Insert new artist
        const [result] = await pool.query(
          'INSERT INTO artists (artist_name, spotify_id) VALUES (?, ?)',
          [artist.name, artist.id]
        );
        artistId = result.insertId;
        console.log(`Added artist: ${artist.name}`);
      }

      // Link artist to user favorites
      await pool.query(
        'INSERT IGNORE INTO user_fav_artists (user_id, artist_id) VALUES (?, ?)',
        [userId, artistId]
      );
    }

    console.log('Fetching top tracks from Spotify...');
    // Fetch top tracks
    const tracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 5, time_range: 'medium_term' }
    });

    console.log(`Found ${tracksResponse.data.items.length} top tracks`);

    // Store tracks and link to user
    for (const track of tracksResponse.data.items) {
      // Get or create artist for this track
      const mainArtist = track.artists[0];
      const [existingArtists] = await pool.query(
        'SELECT id FROM artists WHERE spotify_id IN (SELECT spotify_id FROM artists WHERE spotify_id = ?)',
        [mainArtist.id]
      );

      let artistId;
      if (existingArtists.length > 0) {
        artistId = existingArtists[0].id;
      } else {
        const [result] = await pool.query(
          'INSERT INTO artists (artist_name, spotify_id) VALUES (?, ?)',
          [mainArtist.name, mainArtist.id]
        );
        artistId = result.insertId;
      }

      // Check if song exists using subquery
      const [existingSongs] = await pool.query(
        'SELECT id FROM songs WHERE spotify_id IN (SELECT spotify_id FROM songs WHERE spotify_id = ?)',
        [track.id]
      );

      let songId;
      if (existingSongs.length > 0) {
        songId = existingSongs[0].id;
      } else {
        // Insert new song
        const [result] = await pool.query(
          'INSERT INTO songs (song_name, artist_id, spotify_id) VALUES (?, ?, ?)',
          [track.name, artistId, track.id]
        );
        songId = result.insertId;
        console.log(`Added song: ${track.name}`);
      }

      // Link song to user favorites
      await pool.query(
        'INSERT IGNORE INTO user_fav_songs (user_id, song_id) VALUES (?, ?)',
        [userId, songId]
      );
    }

    // Fetch and store listening time
    await fetchAndStoreListeningTime(userId, accessToken);

    console.log('Successfully stored all Spotify data for user:', userId);
  } catch (error) {
    console.error('Error fetching Spotify data:');
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Fetch user's listening time from Spotify and store in database
async function fetchAndStoreListeningTime(userId, accessToken) {
  try {
    console.log('Fetching listening history from Spotify...');
    
    // Calculate the start and end of November (current year)
    const now = new Date();
    const year = now.getFullYear();
    const startOfNovember = new Date(year, 10, 1); // Month 10 = November (0-indexed)
    const endOfNovember = new Date(year, 11, 0); // Month 11 = December, day 0 = last day of November
    endOfNovember.setHours(23, 59, 59, 999); // End of the day
    
    console.log(`Fetching listening data for November ${year} from ${startOfNovember.toISOString()} to ${endOfNovember.toISOString()}`);
    
    // Fetch recently played tracks with pagination
    let totalMinutes = 0;
    let trackCount = 0;
    let novemberTrackCount = 0;
    let url = 'https://api.spotify.com/v1/me/player/recently-played';
    let params = { 
      limit: 50
    };
    
    let hasMoreTracks = true;
    let requestCount = 0;
    const maxRequests = 30; // Increase limit to get more data for full month
    let beforeTimestamp = Math.floor(endOfNovember.getTime()) + 86400000; // Start from end of November + buffer
    
    while (hasMoreTracks && requestCount < maxRequests) {
      requestCount++;
      params.before = beforeTimestamp;
      console.log(`Request ${requestCount}: Fetching tracks before ${new Date(beforeTimestamp).toISOString()}`);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: params
      });
      
      console.log(`Received ${response.data.items.length} tracks in request ${requestCount}`);
      
      if (!response.data || !response.data.items || response.data.items.length === 0) {
        console.log('No more tracks found');
        hasMoreTracks = false;
        break;
      }
      
      // Process tracks and calculate listening time for November
      let tracksInNovember = 0;
      let tracksBeforeNovember = 0;
      let tracksAfterNovember = 0;
      
      for (const item of response.data.items) {
        if (item.played_at && item.track && item.track.duration_ms) {
          const playedAt = new Date(item.played_at);
          trackCount++;
          
          // Check if track was played in November
          if (playedAt >= startOfNovember && playedAt <= endOfNovember) {
            totalMinutes += (item.track.duration_ms / 1000 / 60);
            tracksInNovember++;
            novemberTrackCount++;
          } else if (playedAt < startOfNovember) {
            // Track is from before November
            tracksBeforeNovember++;
          } else if (playedAt > endOfNovember) {
            // Track is from after November (shouldn't happen with before parameter, but just in case)
            tracksAfterNovember++;
          }
        }
      }
      
      console.log(`Request ${requestCount}: ${tracksInNovember} November tracks, ${tracksBeforeNovember} before Nov, ${tracksAfterNovember} after Nov`);
      
      // Check if we should continue pagination
      if (response.data.items.length < 50) {
        console.log('Reached end of available tracks');
        hasMoreTracks = false;
      } else {
        // Get the oldest track's timestamp for the next request
        const lastItem = response.data.items[response.data.items.length - 1];
        if (lastItem.played_at) {
          beforeTimestamp = Math.floor(new Date(lastItem.played_at).getTime());
          console.log(`⏭️  Next request will fetch tracks before ${new Date(beforeTimestamp).toISOString()}`);
        } else {
          hasMoreTracks = false;
        }
      }
      
      // If we've found many tracks from before November, we might have captured everything
      // But continue a few more requests to be sure we didn't miss anything
      if (tracksBeforeNovember > 20 && requestCount > 10) {
        console.log('⏹️  Found many tracks from before November, continuing a few more requests to ensure completeness');
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Round to nearest whole number
    const roundedMinutes = Math.round(totalMinutes);
    
    // Store in database
    await pool.query(
      'UPDATE users SET listening_minutes = ? WHERE id = ?',
      [roundedMinutes, userId]
    );

    console.log(`Stored ${roundedMinutes} minutes of November listening time for user:`, userId);
    console.log(`Made ${requestCount} requests to Spotify API`);
    console.log(`Processed ${trackCount} total tracks, ${novemberTrackCount} November tracks`);
    return roundedMinutes;
  } catch (error) {
    console.error('Error fetching/storing listening time:', error.message);
    console.error('Error stack:', error.stack);
    // Even if we fail to fetch listening time, don't let it break the whole process
    return 0;
  }
}

module.exports = passport;
