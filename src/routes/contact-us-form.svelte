<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formSchema, type FormSchema } from '$lib/schema';
	import { Description } from 'formsnap';
	import { toast } from 'svelte-sonner';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance, message } = form;

	let dialogOpen = false;

	$: if ($message?.status === 'success') {
		dialogOpen = false;
		toast.success('Message sent! We will get back to you within a business day.');
	}
</script>

<Dialog.Root open={dialogOpen} onOpenChange={(isOpen) => (dialogOpen = isOpen)}>
	<Dialog.Trigger class={buttonVariants()}>Contact Us</Dialog.Trigger>
	<Dialog.Content>
		<form method="post" use:enhance>
			<Form.Field {form} name="emailAddress">
				<Form.Control let:attrs>
					<Form.Label>Email address</Form.Label>
					<Input {...attrs} bind:value={$formData.emailAddress} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Name</Form.Label>
					<Input {...attrs} bind:value={$formData.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="message">
				<Form.Control let:attrs>
					<Form.Label>Message</Form.Label>
					<Textarea {...attrs} bind:value={$formData.message} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
