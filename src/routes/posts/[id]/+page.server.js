import { redirect } from '@sveltejs/kit'
import { API_HOST } from '$env/static/private';

export const load = async ({ params }) => {
	let post = [];

	let res = await fetch(`${API_HOST}/posts/${params.id}`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json'
		},
	});

	post = await res.json()

	let comments = [];

	res = await fetch(`${API_HOST}/comments/posts/${params.id}`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json'
		},
	});

	comments = await res.json()

	return {
	  post,
	  comments
	};
}


const addComment = async ({ request, locals, params }) => {
	const data = await request.formData()
	const description = data.get('description')
	const parentId = data.get('parentId')

	// redirect user if not logged in
	if (!locals.user) {
		throw redirect(302, '/login')
	}
	
	// MAKE POST REQUEST
	await fetch(`${API_HOST}/comments/posts/${params.id}`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${locals.user.jwt}`
		},
		body: JSON.stringify({description, parentId})
	});

	// redirect the user
	throw redirect(302, `/posts/${params.id}`)
}

const deleteComment = async ({ request, locals, params }) => {
	const data = await request.formData()
	const commentId = data.get('commentId')
	
	// MAKE DELETE REQUEST
	await fetch(`${API_HOST}/comments/${commentId}`, {
		method: 'DELETE',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${locals.user.jwt}`
		}
	});

	// redirect the user
	throw redirect(302, `/posts/${params.id}`)
}

export const actions = { addComment, deleteComment }