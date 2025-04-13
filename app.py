import json

with open("test.json", "r") as file:
    json_text = json.load(file)

class DeadAirCalculator:
    def _init_(self, labels):
        self.labels = labels

    def generate_text_info(self):
        for label in self.labels:
            metadata = label['metadata']
            start_time = metadata['start_time']
            end_time = metadata['end_time']
            time_taken = end_time - start_time
            text_ = label['text']
            speaker = label.get('value', None)

            yield {
                'type': speaker,
                'text': text_,
                'start_time': start_time,
                'end_time': end_time,
                'duration': time_taken
            }

    def merge_dead_air(self):
        merged_output = []
        for i in range(len(self.labels)):
            current = self.labels[i]
            entry = {
                'type': current.get('value'),
                'text': current['text'],
                'start_time': current['metadata']['start_time'],
                'end_time': current['metadata']['end_time'],
                'duration': current['metadata']['end_time'] - current['metadata']['start_time']
            }

            # Check for dead air
            if i < len(self.labels) - 1:
                next_segment = self.labels[i + 1]
                gap = next_segment['metadata']['start_time'] - current['metadata']['end_time']
                if gap > 0:
                    entry['duration'] += gap
                    entry['end_time'] = next_segment['metadata']['start_time']

            merged_output.append(entry)

        return merged_output

# Use the class
calculator = DeadAirCalculator(json_text['labels'])
final_output = calculator.merge_dead_air()

# Print result
for item in final_output:
    print(item)
