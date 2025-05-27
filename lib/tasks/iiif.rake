# ✅ Permissions test — this comment confirms ChatGPT can edit this file
# lib/tasks/iiif.rake

require 'json'
require 'csv'
require 'fileutils'

namespace :iiif do
  desc 'Generate IIIF manifests for items listed in _data metadata CSV'
  task :items do
    csv_path = Dir.glob('_data/iiif-cb-demo.csv').first
    abort "❌ No metadata CSV found in _data/" unless csv_path

    puts "📄 Reading metadata from: #{csv_path}"
    metadata = CSV.read(csv_path, headers: true)

    metadata.each do |row|
      id = row['objectid'] || row['id']
      next unless id

      img_path = "objects/#{id}.jpg"
      unless File.exist?(img_path)
        puts "⚠️  Skipping #{id}: image not found at #{img_path}"
        next
      end

      manifest_dir = File.join('objects', id)
      FileUtils.mkdir_p(manifest_dir)
      manifest_path = File.join(manifest_dir, 'manifest.json')

      manifest = {
        '@context': 'http://iiif.io/api/presentation/2/context.json',
        '@id': "/objects/#{id}/manifest.json",
        '@type': 'sc:Manifest',
        'label': row['title'] || id,
        'description': row['description'] || '',
        'sequences': [
          {
            '@type': 'sc:Sequence',
            'canvases': [
              {
                '@id': "/objects/#{id}/canvas",
                '@type': 'sc:Canvas',
                'label': row['title'] || id,
                'height': 1000,
                'width': 1000,
                'images': [
                  {
                    '@type': 'oa:Annotation',
                    'motivation': 'sc:painting',
                    'resource': {
                      '@id': "/objects/#{id}.jpg",
                      '@type': 'dctypes:Image',
                      'format': 'image/jpeg',
                      'height': 1000,
                      'width': 1000
                    },
                    'on': "/objects/#{id}/canvas"
                  }
                ]
              }
            ]
          }
        ]
      }

      File.open(manifest_path, 'w') do |f|
        f.write(JSON.pretty_generate(manifest))
      end

      puts "✅ Generated manifest for #{id} → #{manifest_path}"
    end

    puts "\n🎉 Done! IIIF manifests are in /objects/[id]/manifest.json"
  end
end