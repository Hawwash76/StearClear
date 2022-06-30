import { useQuery } from "react-query"
import request from "../../axios"
import { Campaign } from "../../Components/Campaign/api"
import { PostContent } from "../../Components/Post/api"
import { useAuth } from "../../Context/Auth/useAuth"
import { getErrorMessage } from "../../utils/getErrorMessage"
import getValidImage from "../../utils/getValidImage"
import { showSnackbar } from "../../utils/showSnackbar"

export const useUserPosts = (postUserId: string) => {
	const { user } = useAuth()
	const {
		data,
		isLoading,
		refetch: refetchUserPosts
	} = useQuery(
		["fetchUserPosts", postUserId, user.id],
		async () => {
			try {
				const response = await request.get(
					`post/personal-posts?userId=${user.id}&postUserId=${
						user.id !== postUserId ? `${postUserId}` : ""
					}`
				)
				const posts = response.data.data
				return posts.map((post: any) => {
					return {
						...post,
						user: {
							...post.user,
							image: getValidImage(post.user.image)
						},
						likes: post.likes.map((like: any) => ({
							...like,
							likedAt: new Date(like.likedAt)
						}))
					}
				}) as PostContent[]
			} catch (e: any) {
				showSnackbar(getErrorMessage(e), "error")
			}
		},
		{
			enabled: !!postUserId && !!user.id
		}
	)

	return { isFetchingPosts: isLoading, userPosts: data, refetchUserPosts }
}

export const useUserCampaigns = (campaignUserId: string) => {
	const { user } = useAuth()
	const {
		data,
		isLoading,
		refetch: refetchUserCampaings
	} = useQuery(
		["fetchUserCampaigns", campaignUserId, user.id],
		async () => {
			try {
				const response = await request.post(`campaign/retrieve`, {
					include: {
						user: true
					},
					userId: campaignUserId !== user.id ? campaignUserId : user.id
				})
				const campaigns = response.data.data
				return campaigns.map((c: any) => {
					return {
						...c,
						user: {
							...c.user,
							image: getValidImage(c.user.image)
						}
					}
				}) as Campaign[]
			} catch (e: any) {
				showSnackbar(getErrorMessage(e), "error")
			}
		},
		{
			enabled: !!campaignUserId && !!user.id
		}
	)

	return {
		isFetchingCampaigns: isLoading,
		campaigns: data,
		refetchUserCampaings
	}
}

export const useIsFollowing = (postUserId: string) => {
	const { user } = useAuth()
	const { data, isLoading, error, refetch } = useQuery(
		["isFollowingPostUser", postUserId, user.id],
		async () => {
			try {
				const response = await request.post(`user/is-following`, {
					followerId: user.id,
					followedId: postUserId
				})

				const isFollowing = response.data.data
				return isFollowing
			} catch (e: any) {
				showSnackbar(getErrorMessage(e), "error")
			}
		},
		{
			enabled: !!postUserId && !!user.id
		}
	)

	if (error) showSnackbar(error + "", "error")

	return {
		isFetchingFollowStatus: isLoading,
		followStatus: data,
		refetchFollowStatus: refetch
	}
}

export const useFollow = (postUserId: string) => {
	const { user } = useAuth()
	const { isLoading: isFollowing, refetch: follow } = useQuery(
		["followUser", postUserId, user.id],
		async () => {
			try {
				await request.post(`user/follow`, {
					followerId: user.id,
					followedId: postUserId
				})
			} catch (e: any) {
				showSnackbar(getErrorMessage(e), "error")
			}
		},
		{
			enabled: false
		}
	)

	const { isLoading: isUnfollowing, refetch: unfollow } = useQuery(
		["unfollowUser", postUserId, user.id],
		async () => {
			try {
				await request.post(`user/unfollow`, {
					followerId: user.id,
					followedId: postUserId
				})
			} catch (e: any) {
				showSnackbar(getErrorMessage(e), "error")
			}
		},
		{
			enabled: false
		}
	)

	return {
		isFollowing,
		follow,
		unfollow,
		isUnfollowing
	}
}
