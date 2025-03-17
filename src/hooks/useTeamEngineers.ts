-import { supabase } from '../lib/supabase';
 import { useStore } from '../store';
@@ .. @@
   useEffect(() => {
    if (!teamId) {
      setEngineers([]);
      return setLoading(false);
    }

    // Filter engineers from store
    const teamEngineers = store.users.filter(user => 
      user.teamId === teamId && 
      (user.role === 'ENGINEER' || user.role === 'ENGINEER_MANAGER')
    );
    setEngineers(teamEngineers);
    setLoading(false);

  }, [teamId, store.users]);