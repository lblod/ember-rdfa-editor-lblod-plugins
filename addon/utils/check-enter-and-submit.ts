export default function checkEnterAndSubmit(
  callback: (event: Event) => void,
  event: KeyboardEvent,
) {
  if (event.key === 'Enter') {
    callback(event);
  }
}
