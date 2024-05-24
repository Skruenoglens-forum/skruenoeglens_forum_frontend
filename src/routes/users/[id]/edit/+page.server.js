import { fail, redirect } from '@sveltejs/kit'
import { API_HOST } from '$env/static/private';

export const load = async ({ locals, params }) => {
	// redirect user if not logged TODO: remember to only allow to edit owned users
    if (!locals.user) {
		throw redirect(302, '/login')
	}

	let user = [];

	const res = await fetch(`${API_HOST}/users/${params.id}`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${locals.user.jwt}`
		},
	});

	user = await res.json()

	return {
	  user
	};
}

const edit = async ({ locals, request, params }) => {
	const data = await request.formData()
	const profileImage = data.get('profileImage');
    const name = data.get('name')
	const email = data.get('email')
	const description = data.get('description')

	if (typeof name !== 'string' || typeof email !== 'string' || typeof description !== 'string' || !name || !email || !description) {
		return fail(400, { invalid: true });
	}

	let base64String = null;
	if (profileImage && profileImage instanceof Blob) {
		const arrayBuffer = await profileImage.arrayBuffer();
		base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
	}

	// MAKE PUT EDIT REQUEST
	const response = await fetch(`${API_HOST}/users/${params.id}`, {
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${locals.user.jwt}`
		},
		body: JSON.stringify({ name, email, description, profileImage: base64String })
	});
	
	if (!response.ok) {
		console.log(response.status)
		return fail(400, { user: true });
	}

	throw redirect(303, `/users/${params.id}`)
}

const newpassword = async ({ locals, request, params }) => {
	const data = await request.formData()
    const newPassword = data.get('new-password')

	if (typeof newPassword !== 'string' || !newPassword) {
		return fail(400, { invalid: true });
	}

	// MAKE PUT NEW PASSWORD REQUEST
	const response = await fetch(`${API_HOST}/auth/new/password/${params.id}`, {
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${locals.user.jwt}`
		},
		body: JSON.stringify({ "newPassword": newPassword })
	});

	if (!response.ok) {
		console.log(response.status)
		return fail(400, { user: true });
	}

	throw redirect(303, `/`)
}

export const actions = { edit, newpassword }