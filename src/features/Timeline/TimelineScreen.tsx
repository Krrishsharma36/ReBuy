import React, { useState, useEffect } from 'react';
import { Search, Tag, X, Archive, Calendar, ShoppingBag } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { EmptyState } from '../../components/EmptyState';
import { Card } from '../../components/Card';
import { ObjectRepository } from '../../database/repositories/ObjectRepository';
import { ActivityRepository } from '../../database/repositories/ActivityRepository';
import { ReBuyObject, ReBuyActivity } from '../../types';

export function TimelineScreen() {
  const { navigateTo } = useNavigation();

  // DB States
  const [activities, setActivities] = useState<ReBuyActivity[]>([]);
  const [objectMap, setObjectMap] = useState<Record<string, ReBuyObject>>({});
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const objectRepo = new ObjectRepository();
  const activityRepo = new ActivityRepository();

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const allObjects = await objectRepo.getAll(true);
      const allActivities = await activityRepo.getAll(false);

      // Create quick objectId mapping
      const mapping: Record<string, ReBuyObject> = {};
      allObjects.forEach(o => {
        mapping[o.id] = o;
      });
      setObjectMap(mapping);

      // Extract unique tags for filtering
      const tagsSet = new Set<string>();
      allObjects.forEach(o => o.tags.forEach(t => tagsSet.add(t)));
      setRecentTags(Array.from(tagsSet));

      // Sort activities descending (newest first)
      setActivities(allActivities.sort(
        (a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
      ));
    } catch (e) {
      console.error('[TimelineScreen] Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities dynamically
  const filteredActivities = activities.filter((act) => {
    const parentObj = objectMap[act.objectId];
    if (!parentObj) return false;

    const matchesSearch =
      parentObj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.shop && act.shop.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (act.remarks && act.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? parentObj.tags.includes(selectedTag) : true;

    return matchesSearch && matchesTag;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-14" style={{ textAlign: 'center', padding: 'var(--space-48)' }}>Loading timeline entries...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      {/* Title */}
      <div>
        <h1 className="text-28" style={{ fontWeight: 700 }}>Timeline</h1>
        <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
          Browse your chronological memory timeline
        </p>
      </div>

      {/* Filters bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search timeline notes, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 36px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-8)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-14)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tag Selector list */}
        {recentTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
            {recentTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-8)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: 'var(--font-12)',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-speed), color var(--transition-speed)'
                  }}
                >
                  <Tag size={10} />
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Timeline Card Stream */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        {filteredActivities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {filteredActivities.map((act) => {
              const parentObj = objectMap[act.objectId];
              return (
                <Card
                  key={act.id}
                  hoverable
                  onClick={() => navigateTo('details', act.objectId)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-16)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {parentObj ? parentObj.name : 'Unknown Object'}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', color: 'var(--text-secondary)' }} className="text-12">
                      {act.shop && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingBag size={10} /> {act.shop}
                        </span>
                      )}
                      <span>• {formatDate(act.activityDate)}</span>
                      {act.quantity && (
                        <span>• ({act.quantity} {act.unit || 'unit'})</span>
                      )}
                    </div>
                    {act.remarks && (
                      <p className="text-12" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{act.remarks}"
                      </p>
                    )}
                  </div>
                  <span className="text-16 font-mono" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    ₹{act.amount.toFixed(2)}
                  </span>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Archive size={32} />}
            title="No activity entries"
            description="Log your first purchase or adjust filters to view items."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
          />
        )}
      </section>
    </div>
  );
}

