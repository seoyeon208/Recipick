import { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '../types';
import { RecipeCard } from './RecipeCard';
import { Trash2, ChefHat, User, UserPlus, UserMinus, Users, Heart, BookOpen, Edit2, Camera, ArrowLeft, X } from 'lucide-react';

interface MyPageProps {
  userRecipes: Recipe[];
  favorites: string[];
  ingredients: Ingredient[];
  currentUser: string | null;
  viewingUser: string | null;
  onRecipeClick: (recipe: Recipe) => void;
  onFavoriteToggle: (recipeId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onViewProfile: (username: string) => void;
  onBack: () => void;
}

interface UserProfile {
  username: string;
  bio: string;
  profileImage: string;
  followerCount: number;
  followingCount: number;
}

type TabType = 'recipes' | 'favorites';
type ModalType = 'followers' | 'following' | null;

export function MyPage({
  userRecipes,
  favorites,
  ingredients,
  currentUser,
  viewingUser,
  onRecipeClick,
  onFavoriteToggle,
  onDeleteRecipe,
  onEditRecipe,
  onViewProfile,
  onBack,
}: MyPageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: currentUser || '사용자',
    bio: '',
    profileImage: '',
    followerCount: 0,
    followingCount: 0,
  });
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const [modalType, setModalType] = useState<ModalType>(null);

  // 실제 보고 있는 사용자 (다른 사람의 프로필을 볼 때는 viewingUser, 내 프로필을 볼 때는 currentUser)
  const displayUser = viewingUser || currentUser;
  const isOwnProfile = !viewingUser || viewingUser === currentUser;

  // Filter recipes by display user
  const myRecipes = userRecipes.filter(recipe => recipe.author === displayUser);

  // Get all recipes for favorites
  const allRecipes = userRecipes;
  const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));

  // localStorage에서 프로필 불러오기
  useEffect(() => {
    if (displayUser) {
      const savedProfiles = localStorage.getItem('userProfiles');
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        if (profiles[displayUser]) {
          setProfile(profiles[displayUser]);
          setTempProfile(profiles[displayUser]);
        } else {
          // 처음 로그인한 경우 초기 프로필 생성
          const initialProfile = {
            username: displayUser,
            bio: '',
            profileImage: '',
            followerCount: 0,
            followingCount: 0,
          };
          setProfile(initialProfile);
          setTempProfile(initialProfile);
          if (isOwnProfile) {
            saveProfile(initialProfile);
          }
        }
      } else {
        // 프로필이 아예 없는 경우
        const initialProfile = {
          username: displayUser,
          bio: '',
          profileImage: '',
          followerCount: 0,
          followingCount: 0,
        };
        setProfile(initialProfile);
        setTempProfile(initialProfile);
        if (isOwnProfile) {
          saveProfile(initialProfile);
        }
      }

      // 팔로우 상태 불러오기
      if (!isOwnProfile && currentUser) {
        const followData = localStorage.getItem('followData');
        if (followData) {
          const follows = JSON.parse(followData);
          const key = `${currentUser}->${displayUser}`;
          setIsFollowing(follows[key] || false);
        }
      }
    }
  }, [displayUser, isOwnProfile, currentUser]);

  // 팔로워/팔로잉 수 실시간 업데이트
  useEffect(() => {
    const updateCounts = () => {
      if (displayUser) {
        const savedProfiles = localStorage.getItem('userProfiles');
        if (savedProfiles) {
          const profiles = JSON.parse(savedProfiles);
          if (profiles[displayUser]) {
            setProfile(profiles[displayUser]);
          }
        }
      }
    };

    // localStorage 변경 감지
    window.addEventListener('storage', updateCounts);
    
    // 주기적으로 체크 (같은 탭 내에서 변경 감지)
    const interval = setInterval(updateCounts, 1000);
    
    return () => {
      window.removeEventListener('storage', updateCounts);
      clearInterval(interval);
    };
  }, [displayUser]);

  const saveProfile = (profileToSave: UserProfile) => {
    if (currentUser) {
      const savedProfiles = localStorage.getItem('userProfiles');
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
      profiles[currentUser] = profileToSave;
      localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }
  };

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    saveProfile(tempProfile);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setIsEditingProfile(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFollowToggle = () => {
    if (!currentUser || !displayUser || isOwnProfile) return;

    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);

    // 팔로우 데이터 저장
    const followData = localStorage.getItem('followData');
    const follows = followData ? JSON.parse(followData) : {};
    const key = `${currentUser}->${displayUser}`;
    follows[key] = newFollowingState;
    localStorage.setItem('followData', JSON.stringify(follows));

    // 프로필 업데이트
    const savedProfiles = localStorage.getItem('userProfiles');
    const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};

    // 대상 사용자의 팔로워 수 업데이트
    if (profiles[displayUser]) {
      profiles[displayUser].followerCount += newFollowingState ? 1 : -1;
      // 대상 사용자의 프로필을 즉시 업데이트
      setProfile({...profiles[displayUser]});
    } else {
      // 프로필이 없는 경우 초기 생성
      profiles[displayUser] = {
        username: displayUser,
        bio: '',
        profileImage: '',
        followerCount: newFollowingState ? 1 : 0,
        followingCount: 0,
      };
      setProfile({...profiles[displayUser]});
    }

    // 현재 사용자의 팔로잉 수 업데이트
    if (profiles[currentUser]) {
      profiles[currentUser].followingCount += newFollowingState ? 1 : -1;
    } else {
      profiles[currentUser] = {
        username: currentUser,
        bio: '',
        profileImage: '',
        followerCount: 0,
        followingCount: newFollowingState ? 1 : 0,
      };
    }

    localStorage.setItem('userProfiles', JSON.stringify(profiles));
    
    // 강제로 리렌더링을 위한 이벤트 디스패치
    window.dispatchEvent(new Event('storage'));
  };

  const calculateMatchPercentage = (recipe: Recipe) => {
    const userIngredientNames = ingredients.map(i => i.name.toLowerCase());
    const matchedCount = recipe.ingredients.filter(ing =>
      userIngredientNames.includes(ing.name.toLowerCase())
    ).length;
    return Math.round((matchedCount / recipe.ingredients.length) * 100);
  };

  // 팔로워/팔로잉 목록 가져오기
  const getFollowersList = () => {
    if (!displayUser) return [];
    const followData = localStorage.getItem('followData');
    if (!followData) return [];
    
    const follows = JSON.parse(followData);
    const followers: string[] = [];
    
    // displayUser를 팔로우하는 모든 사용자 찾기
    Object.keys(follows).forEach(key => {
      if (follows[key]) {
        const [follower, target] = key.split('->');
        if (target === displayUser) {
          followers.push(follower);
        }
      }
    });
    
    return followers;
  };

  const getFollowingList = () => {
    if (!displayUser) return [];
    const followData = localStorage.getItem('followData');
    if (!followData) return [];
    
    const follows = JSON.parse(followData);
    const following: string[] = [];
    
    // displayUser가 팔로우하는 모든 사용자 찾기
    Object.keys(follows).forEach(key => {
      if (follows[key]) {
        const [follower, target] = key.split('->');
        if (follower === displayUser) {
          following.push(target);
        }
      }
    });
    
    return following;
  };

  const getProfileByUsername = (username: string): UserProfile => {
    const savedProfiles = localStorage.getItem('userProfiles');
    if (savedProfiles) {
      const profiles = JSON.parse(savedProfiles);
      if (profiles[username]) {
        return profiles[username];
      }
    }
    return {
      username,
      bio: '',
      profileImage: '',
      followerCount: 0,
      followingCount: 0,
    };
  };

  // 탭에 따른 레시피 결정
  const displayRecipes = activeTab === 'recipes' ? myRecipes : favoriteRecipes;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 다른 사람의 프로필을 볼 때 뒤로가기 버튼 */}
        {!isOwnProfile && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={24} />
            <span>돌아가기</span>
          </button>
        )}

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {/* 커버 이미지 */}
          <div className="h-32 bg-gradient-to-r from-[#808000] to-[#a0a000]"></div>
          
          <div className="px-8 pb-8">
            {/* 프로필 이미지 */}
            <div className="flex items-start gap-6 -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="프로필"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditingProfile && (
                  <div className="absolute bottom-0 right-0">
                    <label
                      htmlFor="profileImageUpload"
                      className="bg-white border-2 border-gray-300 text-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-50 shadow-lg"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Camera size={20} />
                      <input
                        type="file"
                        id="profileImageUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex-1 mt-20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="mb-2" style={{ fontWeight: 600 }}>{profile.username}</h1>
                    {isEditingProfile ? (
                      <div className="mb-3">
                        <textarea
                          value={tempProfile.bio}
                          onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808000] resize-none"
                          placeholder="나를 표현하는 한 줄을 입력하세요"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-3">{profile.bio || '아직 소개글이 없습니다.'}</p>
                    )}
                  </div>

                  {/* 본인 프로필: 프로필 편집 버튼, 다른 사용자 프로필: 팔로우 버튼 */}
                  {isOwnProfile ? (
                    !isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                      >
                        <Edit2 size={20} />
                        프로필 편집
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-2 text-white rounded-lg"
                          style={{ backgroundColor: '#808000', fontWeight: 500 }}
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          : 'text-white'
                      }`}
                      style={!isFollowing ? { backgroundColor: '#808000', fontWeight: 500 } : {}}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus size={20} />
                          팔로잉
                        </>
                      ) : (
                        <>
                          <UserPlus size={20} />
                          팔로우
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 통계 */}
                <div className="flex gap-6 mb-4">
                  <div 
                    className="text-center cursor-pointer hover:opacity-80"
                    onClick={() => setModalType('followers')}
                  >
                    <div className="text-2xl mb-1" style={{ color: '#808000', fontWeight: 600 }}>
                      {profile.followerCount}
                    </div>
                    <div className="text-gray-600">팔로워</div>
                  </div>
                  <div 
                    className="text-center cursor-pointer hover:opacity-80"
                    onClick={() => setModalType('following')}
                  >
                    <div className="text-2xl mb-1" style={{ color: '#808000', fontWeight: 600 }}>
                      {profile.followingCount}
                    </div>
                    <div className="text-gray-600">팔로잉</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 섹션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-8 py-4">
              <button
                className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                  activeTab === 'recipes' ? 'border-[#808000] text-[#808000] font-bold' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('recipes')}
              >
                <BookOpen size={20} />
                {isOwnProfile ? '내 레시피' : '유저 레시피'}
              </button>
              {isOwnProfile && (
                <button
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
                    activeTab === 'favorites' ? 'border-[#808000] text-[#808000] font-bold' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart size={20} />
                  즐겨찾기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 컨텐츠 섹션 */}
        <div>
          <h2 className="mb-6" style={{ fontWeight: 600 }}>
            {activeTab === 'recipes' ? '올린 레시피' : '즐겨찾기 레시피'} ({displayRecipes.length})
          </h2>
          
          {displayRecipes.length === 0 ? (
            <div className="bg-white rounded-lg shadow text-center py-12">
              <ChefHat size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {activeTab === 'recipes' ? '아직 올린 레시피가 없네요.' : '아직 즐겨찾기한 레시피가 없네요.'}
              </p>
              <p className="text-gray-400">내가 좋아하는 레시피를 함께 공유해요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRecipes.map(recipe => (
                <div key={recipe.id} className="relative">
                  <RecipeCard
                    recipe={recipe}
                    userIngredients={ingredients}
                    matchPercentage={calculateMatchPercentage(recipe)}
                    onClick={() => onRecipeClick(recipe)}
                    onFavoriteToggle={() => onFavoriteToggle(recipe.id)}
                    isFavorite={favorites.includes(recipe.id)}
                  />
                  {isOwnProfile && activeTab === 'recipes' && recipe.author === displayUser && (
                    <>
                      <button
                        onClick={() => {
                          if (confirm('정말 이 레시피를 삭제하시겠습니까?')) {
                            onDeleteRecipe(recipe.id);
                          }
                        }}
                        className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors z-10"
                        aria-label="레시피 삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => onEditRecipe(recipe)}
                        className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors z-10"
                        aria-label="레시피 수정"
                      >
                        <Edit2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 팔로워/팔로잉 모달 */}
      {modalType && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-30 flex items-center justify-center z-50" onClick={() => setModalType(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold">
                {modalType === 'followers' ? '팔로워' : '팔로잉'} ({modalType === 'followers' ? getFollowersList().length : getFollowingList().length})
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {(modalType === 'followers' ? getFollowersList().length : getFollowingList().length) === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {modalType === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉 중인 사용자가 없습니다.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {(modalType === 'followers' ? getFollowersList() : getFollowingList()).map(user => {
                    const userProfile = getProfileByUsername(user);
                    return (
                      <div 
                        key={user} 
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setModalType(null);
                          onViewProfile(user);
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {userProfile.profileImage ? (
                            <img src={userProfile.profileImage} alt={user} className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user}</p>
                          {userProfile.bio && (
                            <p className="text-sm text-gray-600 truncate">{userProfile.bio}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}